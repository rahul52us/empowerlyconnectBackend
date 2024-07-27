import { NextFunction, Response } from "express";
import {
  createTrip,
  getAllDayTripCount,
  getTripCounts,
  getTrips,
  updateTrip,
} from "../../repository/trip.repository";
import { generateError } from "../../config/Error/functions";
import mongoose from "mongoose";

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

export const getTripsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || undefined;

    const { data, status, totalPages } = await getTrips({
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
    req.body.company = req.bodyData.company;
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
    req.body.company = new mongoose.Types.ObjectId(req.query.company);
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
  } catch (err) {
    next(err);
  }
};
