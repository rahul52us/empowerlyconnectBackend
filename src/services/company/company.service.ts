import { NextFunction, Response } from "express"
import { getCompanyDetailsByName } from "../../repository/company.respository"
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