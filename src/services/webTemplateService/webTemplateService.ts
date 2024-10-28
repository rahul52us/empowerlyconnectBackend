import { Response } from "express"
import { createWebTemplate } from "../../repository/websiteTemplate/websiteTemplate.repository"

export const createWebTemplateService = async(req : any , res : Response) => {
    try
    {
        const {status, statusCode, data, message} =await createWebTemplate(req.body)
        res.status(statusCode).send({
            message,
            data,
            status
        })
    }
    catch(err : any)
    {
        res.status(500).send({
            message : err?.message,
            data : err?.message,
            status : 'error'
        })
    }
}
