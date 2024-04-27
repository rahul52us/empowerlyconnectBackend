import { NextFunction, Response } from "express"
import { getCompanyDetailsByName, getHolidays, updateHolidays } from "../../repository/company/company.respository"
import { generateError } from "../../config/Error/functions"
import mongoose from "mongoose"

export const getCompanyDetailsByNameService = async (req : any, res : Response, next : NextFunction) => {
    try
    {
        const {status , data, statusCode} = await getCompanyDetailsByName({company : req.query.company})
        if(status === "success")
        {
        return res.status(200).send({
            message : 'Company details retrieved successfully',
            data : data,
            status : 'success'
        })
       }
       else
       {
        throw generateError(data,statusCode)
       }
    }
    catch(err : any)
    {
        next(err)
    }
}

export const getHolidayService = async (req : any, res : Response, next : NextFunction) => {
    try
    {
        const {status , data, statusCode, message} = await getHolidays({company : req.body.company})
        return res.status(statusCode).send({
            message : message,
            data : data,
            status : status
        })
    }
    catch(err : any)
    {
        next(err)
    }
}

export const updateHolidayService = async (req : any, res : Response, next : NextFunction) => {
    try
    {
        const {status , data, statusCode, message} = await updateHolidays({holidays:{...req.body},company : new mongoose.Types.ObjectId(req.body.company)})
        return res.status(statusCode).send({
            message : message,
            data : data,
            status : status
        })
    }
    catch(err : any)
    {
        next(err)
    }
}