import { NextFunction, Response } from "express";
import { createRequest, getRequestById, getRequests } from "../../repository/request/Request.repository";
import mongoose from "mongoose";


export const getRequestByIdService = async(req : any, res : Response, next : NextFunction) => {
  try
  {
    const {status, statusCode, data, message} = await getRequestById({_id : new mongoose.Types.ObjectId(req.params.id)})
    return res.status(statusCode).send({
      status : status,
      message : message,
      data : data
    })
  }
  catch(err)
  {
    next(err)
  }
}

export const getRequestService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || undefined;

    const { data, status, totalPages } = await getRequests({
      search: search,
      company: new mongoose.Types.ObjectId(req.query.company),
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

export const createRequestService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.user = req.userId;
    req.body.createdBy = req.userId
    req.body.approvals = [{reason : req.body.reason, status : req.body.status, user : req.body.user}]
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