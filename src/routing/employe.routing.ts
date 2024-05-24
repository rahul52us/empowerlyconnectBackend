import express from "express";
import authenticate from "../modules/config/authenticate";
import {
  updateBankDetialsService,
  createEmployeService,
  getAllEmploysService,
  getCountDesignationStatusService,
  getEmployeByIdService,
  getTotalEmployesService,
  updateEmployeProfileService,
  updateFamilyDetailsService,
  updateWorkExperienceService,
  updateDocumentService,
  updateCompanyDetailsService,
  getUserRoleEmploye,
  getManagersEmploysService,
} from "../services/employe/employ.service";

const router = express.Router();

router.post("/create", authenticate, createEmployeService);
router.put("/profile/:id", authenticate, updateEmployeProfileService);
router.get("/:_id", authenticate, getEmployeByIdService);
router.get("/", authenticate, getAllEmploysService);
router.get("/managers/:id", authenticate, getManagersEmploysService);
router.get("/total/count", authenticate, getTotalEmployesService);
router.get("/designation/count", authenticate, getCountDesignationStatusService);
router.put("/bankDetails/:id",authenticate,updateBankDetialsService)
router.put('/companyDetails/:id',authenticate,updateCompanyDetailsService)
router.put('/familyDetails/:id',authenticate,updateFamilyDetailsService)
router.put('/workExperience/:id',authenticate,updateWorkExperienceService)
router.put('/updateDocuments/:id',authenticate,updateDocumentService)
router.get('/users/roles',authenticate,getUserRoleEmploye)

export default router;