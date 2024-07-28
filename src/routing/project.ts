import express from "express";
import authenticate from "../modules/config/authenticate";
import { updateProjectService , createProjectService, getAllProjectsService, getSingleProjectService, createTaskService, updateTaskService, getProjectCountsService } from "../services/project/project.service";
const router = express.Router();

router.post("/", authenticate, createProjectService);
router.post('/total/count',authenticate,getProjectCountsService)
router.put('/:id',authenticate,updateProjectService);
router.post('/get',authenticate,getAllProjectsService)
router.get('/single/:id',authenticate,getSingleProjectService)
router.post('/task/:projectId',authenticate,createTaskService)
router.put('/task/:taskId',authenticate,updateTaskService)

export default router;