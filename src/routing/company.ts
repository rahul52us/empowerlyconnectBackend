import express from "express";
import {
  createCompany,
  filterCompany,
} from "../modules/organisation/Company";
import { getCompanyDetailsByNameService } from "../services/company/company.service";
const router = express.Router();

router.post("/create", createCompany);
router.get("/search", filterCompany);
router.get('/details', getCompanyDetailsByNameService)
export default router;
