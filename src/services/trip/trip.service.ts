import { NextFunction, Response } from "express";
import { createTrip, getTrips } from "../../repository/trip.repository";

export const createTripService = async (req : any, res : Response,  next : NextFunction) => {
  try {
    const { userId, bodyData } = req;
    const { company } = bodyData;

    req.body.company = company
    req.body.createdBy = userId

    const {status, data} = await createTrip(req.body)
    res.status(201).send({
        status : status,
        data : data
    })
  } catch (err) {
    next(err)
  }
};

export const getTripsService = async (req : any, res : Response, next : NextFunction) => {
    try
    {
        const {status, data} = await getTrips(req.body)
        res.status(200).send({
            status : status,
            data : data
        })
    }
    catch(err : any)
    {
        next(err)
    }
}