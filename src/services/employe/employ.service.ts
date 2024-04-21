import { NextFunction, Response } from "express";
import { createEmployeValidation } from "./utils/validation";
import { generateError } from "../../config/Error/functions";
import {
  updateBankDetails,
  createEmploye,
  getCountDesignationStatus,
  getEmployeById,
  getEmployes,
  getTotalEmployes,
  updateEmployeProfileDetails,
  updateFamilyDetails,
  updateWorkExperienceDetails,
  updateDocumentDetails,
} from "../../repository/employe/employe.repository";
import mongoose from "mongoose";

const createEmployeService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = createEmployeValidation.validate(req.body);
    if (error) {
      throw generateError(error.details, 422);
    }
    const { status, data } = await createEmploye({
      ...value,
      company: req.body.company,
      companyOrg: req.bodyData.companyOrg,
      createdBy:req.userId
    });

    if (status === "success") {
      res.status(200).send({
        message: "CREATE Employe SUCCESSFULLY",
        statusCode: 201,
        data: data,
        success: true,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

const updateEmployeProfileService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, status } = await updateEmployeProfileDetails({
      userId: new mongoose.Types.ObjectId(req.params.id),
      ...req.body,
    });
    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

const getAllEmploysService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || undefined;
    const { data, status, totalPages } = await getEmployes({
      id: req.userId,
      search: search,
      company: req.bodyData.company,
      companyOrg: req.bodyData.companyOrg,
      page: Number(page),
      limit: Number(limit),
    });
    if (status === "success") {
      res.status(200).send({
        status: status,
        data: {
          data,
          totalPages,
        },
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

const getEmployeByIdService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data } = await getEmployeById({
      company: req.bodyData.company,
      employeId: new mongoose.Types.ObjectId(req.params._id),
    });
    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

const getCountDesignationStatusService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data } = await getCountDesignationStatus({
      company: new mongoose.Types.ObjectId(req.bodyData.company),
      companyOrg: req.bodyData.companyOrg,
    });
    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

const getTotalEmployesService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data } = await getTotalEmployes({
      companyOrg: new mongoose.Types.ObjectId(req.bodyData.companyOrg),
    });
    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

const updateBankDetialsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await updateBankDetails(req.body);
    if (status === "success") {
      res.status(201).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const updateFamilyDetailsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await updateFamilyDetails(req.body);
    if (status === "success") {
      res.status(201).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

const updateWorkExperienceService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await updateWorkExperienceDetails(req.body);
    if (status === "success") {
      res.status(201).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

const updateDocumentService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await updateDocumentDetails(req.body);
    if (status === "success") {
      res.status(201).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

export {
  createEmployeService,
  updateEmployeProfileService,
  getAllEmploysService,
  getEmployeByIdService,
  getCountDesignationStatusService,
  getTotalEmployesService,
  updateBankDetialsService,
  updateWorkExperienceService,
  updateDocumentService
};
