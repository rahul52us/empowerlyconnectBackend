import express from "express";
import {
  createCompany,
  filterCompany,
} from "../modules/organisation/Company";
import { getCompanyDetailsByNameService, getHolidayService, updateHolidayService } from "../services/company/company.service";
import authenticate from "../modules/config/authenticate";
const router = express.Router();

router.post("/create", createCompany);
router.get("/search", filterCompany);
router.get('/details', getCompanyDetailsByNameService)
router.post('/policy/holidays',authenticate,getHolidayService)
router.put('/policy/holidays',authenticate,updateHolidayService)

export default router;