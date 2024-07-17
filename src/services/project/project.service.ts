import { NextFunction, Response } from "express";
import {
  createProject,
  createTask,
  getAllProjects,
  getSingleProject,
  updateProject,
  updateTask,
} from "../../repository/project/project.repository";
import mongoose from "mongoose";
import { PaginationLimit } from "../../config/helper/constant";

// CREATE PROJECT SERVICE
export const createProjectService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.createdBy = req.userId;
    const { statusCode, status, data, message } = await createProject(req.body);
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

// UPDATE PROJECT SERVICE
export const updateProjectService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, statusCode, message, data } = await updateProject(req.body);
    res.status(statusCode).send({
      status,
      statusCode,
      message,
      data,
    });
  } catch (err) {
    next(err)
  }
};

// GET ALL PROJECT SERVICE
export const getAllProjectsService = async(req : any, res : Response, next : NextFunction) => {
  try
  {
    req.body.company = new mongoose.Types.ObjectId(req.query.company);

    req.body.page = req.query.page ? Number(req.query.page) : 1
    req.body.limit = req.query.limit ? Number(req.query.limit) : PaginationLimit

    const {status, statusCode, message, data} = await getAllProjects(req.body)
    res.status(statusCode).send({
      status,
      message,
      data
    })
  }
  catch(err : any)
  {
    res.status(500).send({
      data : err?.message,
      message : 'Internal Server Error',
      status : 'error'
    })
  }
}

// GET SINGLE PROJECT
export const getSingleProjectService = async(req : any , res : Response, next : NextFunction) => {
  try
  {
    req.body.company = new mongoose.Types.ObjectId(req.query.company)
    req.body.id = new mongoose.Types.ObjectId(req.params.id)
    const {status, statusCode, data, message} = await getSingleProject(req.body)
    res.status(statusCode).send({
      status,
      message,
      data
    })}
  catch(err : any)
  {
    res.status(500).send({
      data : err?.message,
      message : 'Internal Server Error',
      status : 'error'
    })
  }
}
// CREATE TASK SERVICE

export const createTaskService = async(req : any , res : Response, next : NextFunction) => {
  try
  {
    req.body.projectId = new mongoose.Types.ObjectId(req.params.projectId)
    req.body.company = new mongoose.Types.ObjectId(req.body.company)
    req.body.createdBy = req.userId
    const {status, statusCode, data, message} = await createTask(req.body)
    return res.status(statusCode).send({
      status,
      message,
      data
    })
  }
  catch(err : any)
  {
    res.status(500).send({
      data : err?.message,
      message : 'Internal Server Error',
      status : 'error'
    })
  }
}

export const updateTaskService = async (req : any , res : Response, next : NextFunction) => {
  try
  {
    req.body.projectId = new mongoose.Types.ObjectId(req.body.projectId)
    req.body.taskId = new mongoose.Types.ObjectId(req.params.taskId)
    req.body.company = new mongoose.Types.ObjectId(req.body.company)
    const {status, statusCode, data, message} = await updateTask(req.body)
    return res.status(statusCode).send({
      status,
      message,
      data
    })
  }
  catch(err : any)
  {
    res.status(500).send({
      data : err?.message,
      message : 'Internal Server Error',
      status : 'error'
    })
  }
}
