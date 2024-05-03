import express from "express";
import {
  createCompany,
  filterCompany,
} from "../modules/organisation/Company";
import { getCompanyDetailsByNameService, getHolidayService, getWorkLocationservice, getWorkTimingService, updateHolidayService, updateWorkLocationService, updateWorkTimingService } from "../services/company/company.service";
import authenticate from "../modules/config/authenticate";
const router = express.Router();

router.post("/create", createCompany);
router.get("/search", filterCompany);
router.get('/details', getCompanyDetailsByNameService)
router.get('/policy/holidays',authenticate,getHolidayService)
router.get('/policy/workLocations',authenticate,getWorkLocationservice)
router.get('/policy/workTiming',authenticate,getWorkTimingService)
router.put('/policy/holidays',authenticate,updateHolidayService)
router.put('/policy/workTiming',authenticate,updateWorkTimingService)
router.put('/policy/workLocation',authenticate,updateWorkLocationService)

export default router;