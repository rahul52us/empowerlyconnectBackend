import express from "express";
import authenticate from "../modules/config/authenticate";
import {
  createEmployeService,
  getAllEmploysService,
  getCountDesignationStatusService,
  getEmployeByIdService,
  getTotalEmployesService,
  updateEmployeProfileService,
} from "../services/employe/employ.service";

const router = express.Router();

router.post("/create", authenticate, createEmployeService);
router.put("/profile/:id", authenticate, updateEmployeProfileService);
router.get("/:_id", authenticate, getEmployeByIdService);
router.get("/", authenticate, getAllEmploysService);
router.get("/total/count", authenticate, getTotalEmployesService);
router.get("/designation/count", authenticate, getCountDesignationStatusService);

export default router;