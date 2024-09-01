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
import SendMail from "../../config/sendMail/sendMail";
import { baseDashURL } from "../../config/helper/urls";
import { findUserById } from "../../repository/auth/auth.repository";
import { getCompanyById } from "../../repository/company/company.respository";
import { createToken } from "../token/token.service";
import { generateResetPasswordToken } from "../../config/helper/generateToken";
import { ROLE_TEMPLATES } from "./utils/constant";

// CREATE PROJECT SERVICE

export const getProjectCountsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let matchConditions: any = {};
    matchConditions = {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false },
    };

    let userId = req.body.userId;
    if (userId) {
      userId = new mongoose.Types.ObjectId(userId);
      matchConditions = {
        ...matchConditions,
        $or: [
          { customers: { $elemMatch: { user: userId, isActive: true } } },
          { team_members: { $elemMatch: { user: userId, isActive: true } } },
          { followers: { $elemMatch: { user: userId, isActive: true } } },
          { project_manager: { $elemMatch: { user: userId, isActive: true } } },
        ],
      };
    }

    const { statusCode, status, data, message } = await getProjectCounts({
      matchConditions,
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
    const { statusCode, status, data, message }: any = await createProject(req.body);

    if (status === "success") {
      const company = await getCompanyById(data.company);
      if (!company) {
        return res.status(404).send({ status: "error", statusCode: 404, message: "Company not found" });
      }

      const sendEmails = async (users: any[], role: string) => {
        for (let user of users) {
          if (user.isActive && user.isAdd) {
            const userDetails = await findUserById(user.user);
            if (userDetails) {
              let projectLink: string;
              let { mailSubject, mailTemplate } = ROLE_TEMPLATES[role] || {};
              mailSubject = mailSubject.replace('{projectName}', data.project_name);
              if (user.invitationMail) {
                const token = await createToken({
                  metaData: { projectId: data._id },
                  userId: userDetails._id,
                  token: generateResetPasswordToken(userDetails._id),
                  type: "project",
                  company: data.company,
                });
                projectLink = `${baseDashURL}/project/verify-invitation/${token?.data?.token}`;
              } else {
                projectLink = `${baseDashURL}/project/${data._id}`;
                mailTemplate = mailTemplate.replace('invitation', 'welcome');
                mailSubject = mailSubject.replace('Invitation', 'Welcome');
              }

              const mailData = {
                projectName: data.project_name,
                role : role.split('_').join(' '),
                companyName: company.company_name,
                logoUrl: company.logo?.url,
              };

              await SendMail(
                userDetails.username,
                userDetails.username,
                projectLink,
                "",
                mailSubject,
                mailTemplate,
                mailData
              );
            }
          }
        }
      };

      await Promise.all([
        sendEmails(req.body.followers, 'follower'),
        sendEmails(req.body.team_members, 'team_member'),
        sendEmails(req.body.project_manager, 'project_manager'),
        sendEmails(req.body.customers, 'customer'),
      ]);
    }

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
    if(status === "success"){
      const company = await getCompanyById(data.company);
      if (!company) {
        return res.status(404).send({ status: "error", statusCode: 404, message: "Company not found" });
      }
      const sendEmails = async (users: any[], role: string) => {
        for (let user of users) {
          if (user.isActive && user.isAdd) {
            const userDetails = await findUserById(user.user);
            if (userDetails) {
              let projectLink: string;
              let { mailSubject, mailTemplate } = ROLE_TEMPLATES[role] || {};
              mailSubject = mailSubject.replace('{projectName}', data.project_name);
              if (user.invitationMail) {
                const token = await createToken({
                  metaData: { projectId: data._id },
                  userId: userDetails._id,
                  token: generateResetPasswordToken(userDetails._id),
                  type: "project",
                  company: data.company,
                });
                projectLink = `${baseDashURL}/project/verify-invitation/${token?.data?.token}`;
              } else {
                projectLink = `${baseDashURL}/project/${data._id}`;
                mailTemplate = mailTemplate.replace('invitation', 'welcome');
                mailSubject = mailSubject.replace('Invitation', 'Welcome');
              }

              const mailData = {
                projectName: data.project_name,
                role : role.split('_').join(' '),
                companyName: company.company_name,
                logoUrl: company.logo?.url,
              };

              await SendMail(
                userDetails.username,
                userDetails.username,
                projectLink,
                "",
                mailSubject,
                mailTemplate,
                mailData
              );
            }
          }
        }
      };

      await Promise.all([
        sendEmails(req.body.followers, 'follower'),
        sendEmails(req.body.team_members, 'team_member'),
        sendEmails(req.body.project_manager, 'project_manager'),
        sendEmails(req.body.customers, 'customer'),
      ]);
    }
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
    const { id } = req.params;
    req.body.id = new mongoose.Types.ObjectId(id);

    const { status, statusCode, message, data, extraData } = await addProjectMembers(req.body);

    if (status !== "success" || !extraData?.projectData) {
      return res.status(statusCode).send({ status, statusCode, message, data });
    }

    const [currentUser, company] : any = await Promise.all([
      findUserById(req.body.user),
      getCompanyById(extraData.projectData.company),
    ]);

    if (!currentUser || !company) {
      return res.status(404).send({ status: "error", statusCode: 404, message: "User or Company not found" });
    }

    let projectLink = `${baseDashURL}/project/${extraData.projectData._id}`;
    let mailSubject, mailTemplate;

    if (data.isActive) {
      const token = await createToken({
        metaData: { projectId: extraData.projectData._id },
        userId: currentUser._id,
        token: generateResetPasswordToken(currentUser._id),
        type: "project",
        company: extraData.projectData.company
      });
      projectLink = `${baseDashURL}/project/verify-invitation/${token?.data?.token}`;
      mailSubject = `Invitation to Collaborate on ${extraData.projectData.project_name}`;
      mailTemplate = "project/add_member_invitation_template.html";
    } else {
      mailSubject = `Welcome to the ${extraData.projectData.project_name} Project!`;
      mailTemplate = "project/add_member_template.html";
    }

    const mailData = {
      projectName: extraData.projectData.project_name,
      role: req.body.type,
      companyName: company.company_name,
      logoUrl: company.logo?.url,
    };

    // Send an email to the user
    SendMail(
      currentUser.username,
      currentUser.username,
      projectLink,
      "",
      mailSubject,
      mailTemplate,
      mailData
    );

    res.status(statusCode).send({
      status,
      statusCode,
      message,
      data
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
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false },
    };

    let userId = req.body.userId;
    if (userId) {
      userId = new mongoose.Types.ObjectId(userId);
      matchConditions = {
        ...matchConditions,
        $or: [
          { customers: { $elemMatch: { user: userId, isActive: true } } },
          { team_members: { $elemMatch: { user: userId, isActive: true } } },
          { followers: { $elemMatch: { user: userId, isActive: true } } },
          { project_manager: { $elemMatch: { user: userId, isActive: true } } },
        ],
      };
    }

    // Set pagination defaults
    req.body.page = req.query.page ? Number(req.query.page) : 1;
    req.body.limit = req.query.limit
      ? Number(req.query.limit)
      : PaginationLimit;

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
