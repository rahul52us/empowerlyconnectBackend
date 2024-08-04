import { NextFunction, Response } from "express";
import {
  createTrip,
  getAllDayTripCount,
  getSingleTrips,
  getTripCounts,
  getTrips,
  updateTrip,
} from "../../repository/trip.repository";
import { generateError } from "../../config/Error/functions";
import mongoose from "mongoose";
import { convertIdsToObjects, createCatchError } from "../../config/helper/function";
import { PaginationLimit } from "../../config/helper/constant";

export const createTripService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, bodyData } = req;
    const { companyOrg } = bodyData;

    req.body.createdBy = userId;
    req.body.companyOrg = companyOrg;
    req.body.company = new mongoose.Types.ObjectId(req.body.company);
    const { status, data, statusCode } = await createTrip(req.body);
    res.status(statusCode).send({
      status: status,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};


export const getSingleTripService = async(req : any, res : Response, next : NextFunction) => {
  try
  {
    const _id = new mongoose.Types.ObjectId(req.params.id)
    const {status, statusCode, data, message} =  await getSingleTrips({_id})
    return res.status(statusCode).send({
      status,
      message,
      data
    })
  }
  catch(err : any)
  {
    next(err)
  }
}

export const getTripsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ?  Number(req.query.limit) : PaginationLimit;
    const search = req.query.search || undefined;

    const { data, status, totalPages } = await getTrips({
      search: search,
      company: await convertIdsToObjects(req.body.company),
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

export const updateTripService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body._id = req.params.id;
    const { status, data, statusCode, message } = await updateTrip(req.body);
    return res.status(statusCode).send({
      status: status,
      data: data,
      message: message,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllDayTripCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = await convertIdsToObjects(req.body.company)
    req.body.companyOrg = req.bodyData.companyOrg;
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 6);

    if (!req.body.startDate && !req.body.endDate) {
      req.body.startDate = startDate;
      req.body.endDate = endDate;
    }

    req.body.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate };

    const { status, data } = await getAllDayTripCount(req.body);
    if (status === "success") {
      res.status(200).send({
        data: data,
        message: "GET Counts SUCCESSFULLY",
        status: "success",
      });
    } else {
      throw generateError(data, 400);
    }
  } catch (err) {
    next(err);
  }
};

export const getTripCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = await convertIdsToObjects(req.body.company)
    req.body.companyOrg = req.bodyData.companyOrg;
    const { status, data } = await getTripCounts(req.body);
    if (status === "success") {
      res.status(200).send({
        data: data,
        message: "GET Counts SUCCESSFULLY",
        status: "success",
      });
    } else {
      throw generateError(data, 400);
    }
  } catch (err : any) {
    return createCatchError(err)
  }
};
