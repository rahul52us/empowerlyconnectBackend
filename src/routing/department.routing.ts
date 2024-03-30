import express from "express";
import authenticate from "../modules/config/authenticate";
import { createDepartmentCategoryService, createDepartmentService, getCategoryDepartmentCountService, getCategoryDepartmentService } from "../services/department/department.service";

const router = express.Router();

router.post("/category", authenticate, createDepartmentCategoryService);
router.post('/',authenticate,createDepartmentService)
router.get('/categories',authenticate,getCategoryDepartmentService)
router.get('/categories/count',authenticate,getCategoryDepartmentCountService)

export default router;