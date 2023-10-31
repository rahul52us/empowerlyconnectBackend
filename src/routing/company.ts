import express from "express";
import {
  createCompany,
  filterCompany,
} from "../modules/organisation/Company";
const router = express.Router();

router.post("/create", createCompany);
router.get("/search", filterCompany);
export default router;
