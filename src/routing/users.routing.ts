import express from "express";
import authenticate from "../modules/config/authenticate";
import {
  updateBankDetialsService,
  createUserservice,
  getAllEmploysService,
  getCountDesignationStatusService,
  getUserByIdService,
  getTotalUsersService,
  updateUserProfileService,
  updateFamilyDetailsService,
  updateWorkExperienceService,
  updateDocumentService,
  updateCompanyDetailsService,
  getUserRoleUser,
  getManagersEmploysService,
  getManagerUsersCountsService,
  getUserInfoWithManagerService,
  getUserInfoWithManagerActionService,
  updatePermissionsService,
  getManagersOfUserService,
  getRoleCountOfCompanyService,
  getCompanyDetailsByIdService,
} from "../services/employe/user.service";

const router = express.Router();

router.post("/create", authenticate, createUserservice);
router.put("/profile/:id", authenticate, updateUserProfileService);
router.get('/details/:id',authenticate,getCompanyDetailsByIdService)
router.get("/:_id", authenticate, getUserByIdService);
router.post("/", authenticate, getAllEmploysService);
router.get("/managers/:id", authenticate, getManagersEmploysService);
router.post("/total/count", authenticate, getTotalUsersService);
router.get("/designation/count", authenticate, getCountDesignationStatusService);
router.put("/bankDetails/:id",authenticate,updateBankDetialsService)
router.put('/companyDetails/:id',authenticate,updateCompanyDetailsService)
router.put('/familyDetails/:id',authenticate,updateFamilyDetailsService)
router.put('/workExperience/:id',authenticate,updateWorkExperienceService)
router.put('/updateDocuments/:id',authenticate,updateDocumentService)
router.put('/permissions/:id',authenticate,updatePermissionsService)
router.get('/users/roles',authenticate,getUserRoleUser)
router.post('/managers/Users/count',authenticate,getManagerUsersCountsService)
router.post('/info/Subordinate',getUserInfoWithManagerService)
router.get('/info/Subordinate/:id',getUserInfoWithManagerActionService)
router.get('/getManagers/:userId', getManagersOfUserService)
router.get('/get/roles/count',authenticate,getRoleCountOfCompanyService)

export default router;