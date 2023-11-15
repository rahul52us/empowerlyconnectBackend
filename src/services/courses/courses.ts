import { NextFunction, Response } from "express"
import { getAllCourseCategoryCount } from "../../repository/courses.repository"
import { generateError } from "../../config/Error/functions";

export const getCategoryCoursesCountService = async (req : any, res : Response, next : NextFunction) => {
    try
    {
        req.body.company = req.bodyData.company;
        const {status , data} = await getAllCourseCategoryCount(req.body)
        if(status === "success"){
            res.status(200).send({
                message : 'Get Courses Counts',
                data : data,
                status : 'success'
            })
        }
        else{
            throw generateError(data,400)
        }
    }
    catch(err)
    {
        next(err)
    }
}