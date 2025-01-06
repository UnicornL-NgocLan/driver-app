import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import morgan from "morgan";
import router from "./routes/index.js";
import helmet from "helmet";



const app = express();

// Put these 2 lines above
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(helmet());

const whitelist = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:3000/",
  "http://localhost:5000/",
  "http://localhost:3030",
  "http://localhost:3030/",
  "http://103.161.22.196:3030",
  "http://103.161.22.196:3030/",
  "http://103.161.22.196:3030",
  "http://103.161.22.196:3030/",
  "https://qlts.seateklab.vn",
  "https://qlts.seateklab.vn/",
];

const isOriginAllowed = (origin) => {
  if (whitelist.indexOf(origin) !== -1) {
    return true;
  }
  return false;
};

const corsConfig = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};


app.use(cors(corsConfig));

app.use(express.json());
app.use(morgan("tiny"));

app.use("/api/", router);

const port = process.env.PORT || 5000;
const URI = process.env.MONGO_URI;

const start = async () => {
  try {
    await mongoose.connect(URI);
    console.log("MongoDB connected")
    app.listen(port, () => {  
      console.log("Server is listening on port", port);
    });
  } catch (err) {
    console.log(err)
  }
};

start();

export default app;