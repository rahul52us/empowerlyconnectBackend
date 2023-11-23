import { NextFunction, Response } from "express"
import { getAllCourseCategoryCount, getCourseByCategory } from "../../repository/courses.repository"
import { generateError } from "../../config/Error/functions";
import mongoose from "mongoose";
import { PaginationLimit } from "../../config/helper/constant";

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

export const getCourseByCategoryService = async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    try {
      req.body.category = new mongoose.Types.ObjectId(req.query.category);
      req.body.company = new mongoose.Types.ObjectId(req.bodyData.company);
      req.body.page = req.query.page ? parseInt(req.query.page) : 1;
      req.body.limit = req.query.limit
        ? parseInt(req.query.limit)
        : PaginationLimit;
      const { data, status } = await getCourseByCategory(req.body);
      if (status === "success") {
        res.status(200).send({
          data: data,
          message: "GET Courses SUCCESSFULLY",
          status: "success",
        });
      } else {
        next(data);
      }
    } catch (err) {
      next(err);
    }
}