import { NextFunction, Response } from "express";
import {
  addTripMembers,
  calculateIndividualTripAmount,
  calculateTotalTripsAmount,
  calculateTripAmountByTitle,
  createTrip,
  getAllDayTripCount,
  getSingleTrips,
  getTripCounts,
  getTrips,
  totalTripTypeCount,
  updateTrip,
} from "../../repository/trip/trip.repository";
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

    let matchConditions: any = {
      company: { $in: await convertIdsToObjects(req.body.company) },
      companyOrg: req.bodyData.companyOrg,
      deletedAt: { $exists: false }
    };

    if (req.query.search?.trim()) {
      matchConditions = { ...matchConditions, code: req.query.search?.trim() };
    }

    if(req.body.userId){
      matchConditions = {...matchConditions,"participants.user": { $in: await convertIdsToObjects(req.body.userId) },
    }
  }

    const { data, status, totalPages } = await getTrips({
      matchConditions,
      page : req.query.page ? Number(req.query.page) : 1,
      limit : req.query.limit ?  Number(req.query.limit) : PaginationLimit
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

    let matchConditions : any = {}

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 12);

    if (!req.body.startDate && !req.body.endDate) {
      req.body.startDate = startDate;
      req.body.endDate = endDate;
    }

    matchConditions =  {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false },
      companyOrg : req.bodyData.companyOrg,
      createdAt : { $gte: req.body.startDate, $lte: req.body.endDate }
    }

    if(req.body.userId){
        matchConditions = {...matchConditions,"participants.user": { $in: await convertIdsToObjects(req.body.userId) },
      }
    }

    const { status, data } = await getAllDayTripCount({matchConditions,...req.body});
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
    let matchConditions : any = {}

    matchConditions =  {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false }
    }

    if(req.body.userId){
        matchConditions = {...matchConditions,"participants.user": { $in: await convertIdsToObjects(req.body.userId) },
      }
    }

    const { status, data } = await getTripCounts({matchConditions,...req.body});
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


export const totalTripTypeCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let matchConditions : any = {}

    req.body.company = await convertIdsToObjects(req.body.company)
    req.body.companyOrg = req.bodyData.companyOrg;

    matchConditions =  {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false }
    }

    if(req.body.userId){
        matchConditions = {...matchConditions,"participants.user": { $in: await convertIdsToObjects(req.body.userId) },
      }
    }

    const { status, message , statusCode, data } = await totalTripTypeCount({matchConditions,...req.body});
      res.status(statusCode).send({
        data: data,
        message: message,
        status: status,
      });
  } catch (err : any) {
    return createCatchError(err)
  }
};


export const addTripMembersService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, statusCode, message, data } = await addTripMembers(req.body);
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

export const calculateTripAmountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {

    let matchConditions : any = {}

    req.body.company = await convertIdsToObjects(req.body.company)
    req.body.companyOrg = req.bodyData.companyOrg;

    matchConditions =  {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false }
    }

    if(req.body.userId){
        matchConditions = {...matchConditions,"participants.user": { $in: await convertIdsToObjects(req.body.userId) },
      }
    }

    req.body.limit = req.body.limit ? req.body.limit : 8
    const { status, statusCode, message, data } = await calculateTripAmountByTitle({matchConditions,...req.body});
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

export const calculateTotalTripsAmountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let matchConditions : any = {}

    req.body.company = await convertIdsToObjects(req.body.company)
    req.body.companyOrg = req.bodyData.companyOrg;

    matchConditions =  {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false }
    }

    if(req.body.userId){
        matchConditions = {...matchConditions,"participants.user": { $in: await convertIdsToObjects(req.body.userId) },
      }
    }
    const { status, statusCode, message, data } = await calculateTotalTripsAmount({matchConditions, ...req.body});
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

export const calculateIndividualTripAmountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {

    req.body.company = await convertIdsToObjects(req.body.company)
    if(req.body.tripId){
      req.body.tripId = new mongoose.Types.ObjectId(req.body.tripId)
    }
    const { status, statusCode, message, data } = await calculateIndividualTripAmount(req.body);
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

