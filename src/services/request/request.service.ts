import { NextFunction, Response } from "express";
import {
  checkRequests,
  createRequest,
  deleteRequest,
  findSingleRequestById,
  getRequestById,
  getRequests,
  updateRequest,
} from "../../repository/request/Request.repository";
import mongoose from "mongoose";
import { PaginationLimit } from "../../config/helper/constant";

// GET REQUEST SERVICE BY ID
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

// GET REQUESTS SERVICE
export const getRequestService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || PaginationLimit;
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

// CREATE REQUEST SERVICE
export const createRequestService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, sendTo, reason, status, startDate, endDate }: any = req.body;
    const userId = new mongoose.Types.ObjectId(user);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const approvals = [
      {
        reason,
        status,
        user: userId,
        createdBy: req.userId,
      },
    ];

    // Check the existing request within the date range
    const existingRequest = await checkRequests({
      user: userId,
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
        { startDate: { $lte: start }, endDate: { $gte: end } },
      ],
    });

    if (existingRequest) {
      return res.status(300).send({
        status: "error",
        message:
          "There is already a request within the selected date range. Please choose different dates.",
      });
    }

    req.body = {
      ...req.body,
      user: userId,
      sendTo,
      approvals,
    };

    // Create the request
    const { status: createStatus, data } = await createRequest(req.body);
    if (createStatus === "success") {
      res.status(200).send({
        status: createStatus,
        data,
        message: "Request has been created successfully.",
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};
// UPDATE REQUEST SERVICE
export const updateRequestService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, user, reason } = req.body;
    const {
      statusCode,
      status: st,
      data: request,
    } = await findSingleRequestById({
      _id: new mongoose.Types.ObjectId(req.params.id),
    });
    if (st === "success") {
      switch (status) {
        case "submitted":
          if (request.status !== "pending") {
            return res
              .status(400)
              .json({ data: "Request cannot be submitted", status: "error" });
          }
          request.status = "submitted";
          request.submittedAt = new Date();
          break;
        case "approved":
          request.status = "approved";
          break;
        case "rejected":
          request.status = "rejected";
          break;
        case "cancelled":
          request.status = "cancelled";
          break;
        default:
          return res.status(400).json({ error: "Invalid action" });
      }
      request.approvals.push({
        user: user,
        status: status,
        reason: reason,
        createdBy: req.userId,
      });
      const updatedData = await updateRequest(request);
      res.status(200).send({
        status: "success",
        data: updatedData,
        statusCode: 200,
      });
    }
  } catch (err) {
    next(err);
  }
};

// DELETE REQUEST SERVICE
export const deleteRequestService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { statusCode, status, data, message } = await deleteRequest({
      _id: new mongoose.Types.ObjectId(req.params.id),
    });
    return res.status(statusCode).send({
      status,
      data,
      message,
    });
  } catch (err: any) {
    res.status(500).send({
      message: err?.message,
      data: err?.message,
      status: "error",
    });
  }
};
