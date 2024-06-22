import { NextFunction, Response } from "express";
import {
  createRequest,
  findSingleRequestById,
  getRequestById,
  getRequests,
  updateRequest,
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
    req.body.sendTo = req.body.sendTo,
    req.body.approvals = [
      {
        reason: req.body.reason,
        status: req.body.status,
        user: req.body.user,
        createdBy:req.userId
      },
    ];

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

export const updateRequestService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {status, user, reason} = req.body
    const {statusCode, status : st, data : request} = await findSingleRequestById({_id : new mongoose.Types.ObjectId(req.params.id)})
    if(st === "success"){
      switch (status) {
        case 'submitted':
          if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request cannot be submitted' });
          }
          request.status = 'submitted';
          request.submittedAt = new Date();
          break;
        case 'approved':
          request.status = 'approved';
          break;
        case 'rejected':
          request.status = 'rejected';
          break;
        case 'cancelled':
          request.status = 'cancelled';
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
        request.approvals.push({
        user: user,
        status : status,
        reason : reason,
        createdBy : req.userId
      });
      const updatedData = await updateRequest(request)
      res.status(200).send({
        status : 'success',
        data : updatedData,
        statusCode : 200
      })
    }
  } catch (err) {
    next(err);
  }
};
