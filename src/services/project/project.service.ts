import { NextFunction, Response } from "express";
import {
  addProjectMembers,
  createProject,
  createTask,
  getAllProjects,
  getAllTask,
  getProjectCounts,
  getSingleProject,
  getSingleTask,
  updateProject,
  updateTask,
} from "../../repository/project/project.repository";
import mongoose from "mongoose";
import { PaginationLimit } from "../../config/helper/constant";
import { convertIdsToObjects } from "../../config/helper/function";

// CREATE PROJECT SERVICE

export const getProjectCountsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let matchConditions: any = {};
    matchConditions = {
      company: { $in: await convertIdsToObjects(req.body.company)},
      deletedAt: { $exists: false },
    };

    let userId = req.body.userId;
    if (userId) {
      userId = new mongoose.Types.ObjectId(userId)
      matchConditions = {
        ...matchConditions,
        $or: [
          { customers: { $elemMatch: { user:  userId, isActive: true } } },
          { team_members: { $elemMatch: { user: userId, isActive: true } } },
          { followers: { $elemMatch: { user: userId, isActive: true } } },
          { project_manager: { $elemMatch: { user: userId, isActive: true } } },
        ],
      };
    }

    const { statusCode, status, data, message } = await getProjectCounts({
      matchConditions
    });
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const createProjectService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.createdBy = req.userId;
    const { statusCode, status, data, message }: any = await createProject(
      req.body
    );
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
    next(err);
  }
};

export const addProjectMembersService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, statusCode, message, data } = await addProjectMembers(req.body);
    res.status(statusCode).send({
      status,
      statusCode,
      message,
      data,
    });
  } catch (err) {
    next(err);
  }
};



export const getAllProjectsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let matchConditions: any = {};

      matchConditions = {
      company: { $in: await convertIdsToObjects(req.body.company)},
      deletedAt: { $exists: false },
    };

    let userId = req.body.userId;
    if (userId) {
      userId = new mongoose.Types.ObjectId(userId)
      matchConditions = {
        ...matchConditions,
        $or: [
          { customers: { $elemMatch: { user:  userId, isActive: true } } },
          { team_members: { $elemMatch: { user: userId, isActive: true } } },
          { followers: { $elemMatch: { user: userId, isActive: true } } },
          { project_manager: { $elemMatch: { user: userId, isActive: true } } },
        ],
      };
    }

    // Set pagination defaults
    req.body.page = req.query.page ? Number(req.query.page) : 1;
    req.body.limit = req.query.limit ? Number(req.query.limit) : PaginationLimit;

    // Fetch projects using the match conditions and pagination settings
    const { status, statusCode, message, data } = await getAllProjects({
      matchConditions,
      ...req.body,
    });

    res.status(statusCode).send({
      status,
      message,
      data,
    });
  } catch (err: any) {
    // Handle errors
    res.status(500).send({
      data: err?.message,
      message: "Internal Server Error",
      status: "error",
    });
  }
};


// GET SINGLE PROJECT
export const getSingleProjectService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = new mongoose.Types.ObjectId(req.query.company);
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, statusCode, data, message } = await getSingleProject(
      req.body
    );
    res.status(statusCode).send({
      status,
      message,
      data,
    });
  } catch (err: any) {
    res.status(500).send({
      data: err?.message,
      message: "Internal Server Error",
      status: "error",
    });
  }
};
// CREATE TASK SERVICE
export const getSingleTaskService = async (req: any, res: Response) => {
  try {
    const { status, statusCode, data, message } = await getSingleTask({
      _id: new mongoose.Types.ObjectId(req.params.id),
    });
    res.status(statusCode).send({
      message,
      status,
      data,
    });
  } catch (err: any) {
    res.status(500).send({
      data: err?.message,
      message: "Internal Server Error",
      status: "error",
    });
  }
};

export const getAllTaskService = async (req: any, res: Response) => {
  try {
    req.body.company = await convertIdsToObjects(req.body.company);
    req.body.page = req.query.page ? Number(req.query.page) : 1;
    req.body.limit = req.query.limit
      ? Number(req.query.limit)
      : PaginationLimit;
    req.body.projectId = new mongoose.Types.ObjectId(req.params.projectId);

    const { status, statusCode, message, data } = await getAllTask(req.body);
    res.status(statusCode).send({
      status,
      message,
      data,
    });
  } catch (err: any) {
    res.status(500).send({
      data: err?.message,
      message: "Internal Server Error",
      status: "error",
    });
  }
};

export const createTaskService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.projectId = new mongoose.Types.ObjectId(req.params.projectId);
    req.body.company = new mongoose.Types.ObjectId(req.body.company);
    req.body.createdBy = req.userId;
    const { status, statusCode, data, message } = await createTask(req.body);
    return res.status(statusCode).send({
      status,
      message,
      data,
    });
  } catch (err: any) {
    res.status(500).send({
      data: err?.message,
      message: "Internal Server Error",
      status: "error",
    });
  }
};

export const updateTaskService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.projectId = new mongoose.Types.ObjectId(req.body.projectId);
    req.body.taskId = new mongoose.Types.ObjectId(req.params.taskId);
    req.body.company = new mongoose.Types.ObjectId(req.body.company);
    const { status, statusCode, data, message } = await updateTask(req.body);
    return res.status(statusCode).send({
      status,
      message,
      data,
    });
  } catch (err: any) {
    res.status(500).send({
      data: err?.message,
      message: "Internal Server Error",
      status: "error",
    });
  }
};
