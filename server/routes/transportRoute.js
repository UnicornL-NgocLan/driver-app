import express from "express";
import { authenticateUser, otherUserAuthorize } from "../middleWare.js";
import { transportCtrl } from "../controllers/transportController.js";

const router = express.Router();

router.get("/get-active-transport", authenticateUser, transportCtrl.getActiveTransport);
router.get("/get-transport-line", authenticateUser, transportCtrl.getActiveTransportLine);
router.get("/get-sea-driver", authenticateUser, transportCtrl.getSeaDriver);
router.get("/get-all-sea-driver", authenticateUser, transportCtrl.getAllSeaDriver);
router.patch("/update-sea-transport-line", authenticateUser, otherUserAuthorize, transportCtrl.handleDoneTransportLine);
router.patch(
  "/cancel-sea-transport-line",
  authenticateUser,
  otherUserAuthorize,
  transportCtrl.handleCancelTransportLine
);
router.get("/get-vehicle-list", authenticateUser, otherUserAuthorize, transportCtrl.getAllVehicles);
router.patch(
  "/update-sequence-sea-transport-line",
  authenticateUser,
  otherUserAuthorize,
  transportCtrl.updateSequenceTransportLine
);
router.post("/add-vehicle-odometer-value", authenticateUser, transportCtrl.addVehicleOdometerValue);
router.get("/get-vehicle-odometer-value", authenticateUser, transportCtrl.getVehicleOdometerLines);
router.get("/get-all-warning-reminders", authenticateUser, transportCtrl.getAllWarningReminder);
router.get("/get-all-reminders", authenticateUser, transportCtrl.getAllReminders);
router.patch("/mark-as-done-reminder", authenticateUser, transportCtrl.markAsDoneReminderLine);

export default router.stack;
