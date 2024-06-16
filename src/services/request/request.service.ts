import { NextFunction, Response } from "express";
import {
  createRequest,
  getRequestById,
  getRequests,
} from "../../repository/request/Request.repository";
import mongoose from "mongoose";

export const getRequestByIdService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, statusCode, data, message } = await getRequestById({
      _id: new mongoose.Types.ObjectId(req.params.id),
    });
    return res.status(statusCode).send({
      status: status,
      message: message,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

export const getRequestService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const user = new mongoose.Types.ObjectId(req.query.user);
    const search = req.query.search || undefined;

    let query: any = {
      search: search,
      status: req.query.status || "pending",
      company: new mongoose.Types.ObjectId(req.query.company),
      companyOrg: req.bodyData.companyOrg,
      user: user,
      page: Number(page),
      limit: Number(limit),
    };

    if (req.query.userType === "manager") {
      query = { ...query, managerId: req.query.managerId };
    }

    const { data, status, totalPages } = await getRequests(query);
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

export const createRequestService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.user = new mongoose.Types.ObjectId(req.body.user);
    req.body.createdBy = req.userId;
    req.body.approvals = [
      {
        reason: req.body.reason,
        status: req.body.status,
        user: req.body.user,
        sendTo: req.body.sendTo,
      },
    ];

    console.log("the request body are", req.body);

    const { status, data } = await createRequest(req.body);
    if (status === "success") {
      res.status(200).send({
        status: status,
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};
