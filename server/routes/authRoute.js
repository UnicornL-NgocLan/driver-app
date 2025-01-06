import express from "express";
import {authCtrl} from "../controllers/authController.js";
import {authenticateUser} from '../middleWare.js'


const router = express.Router();

router.post("/login", authCtrl.login);
router.get("/check-auth",authCtrl.checkAuth);
router.delete("/logout",authCtrl.logout);
router.get("/get-companies", authenticateUser ,authCtrl.getUserCompanies);
router.get("/get-user", authenticateUser ,authCtrl.getUserData);
router.patch("/change-company", authenticateUser,authCtrl.changeOdooCompany);


export default router.stack;