import express from "express";
import {authenticateUser,otherUserAuthorize} from '../middleWare.js'
import {transportCtrl} from "../controllers/transportController.js";

const router = express.Router();

router.get("/get-active-transport",authenticateUser,transportCtrl.getActiveTransport);
router.get("/get-transport-line",authenticateUser,transportCtrl.getActiveTransportLine);
router.get("/get-sea-driver",authenticateUser,transportCtrl.getSeaDriver);
router.get("/get-all-sea-driver",authenticateUser,transportCtrl.getAllSeaDriver);
router.patch("/update-sea-transport-line",authenticateUser,otherUserAuthorize,transportCtrl.handleDoneTransportLine);
router.patch("/cancel-sea-transport-line",authenticateUser,otherUserAuthorize,transportCtrl.handleCancelTransportLine);

export default router.stack;