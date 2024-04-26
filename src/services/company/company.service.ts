import { NextFunction, Response } from "express"
import { getCompanyDetailsByName, getHolidays, updateHolidays } from "../../repository/company/company.respository"
import { generateError } from "../../config/Error/functions"

export const getCompanyDetailsByNameService = async (req : any, res : Response, next : NextFunction) => {
    try
    {
        const {status , data, statusCode} = await getCompanyDetailsByName({company : req.query.company})
        if(status === "success")
        {
        return res.status(200).send({
            message : 'Get Company Details Successfully',
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
        const {status , data, statusCode, message} = await updateHolidays({company : req.query.company})
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