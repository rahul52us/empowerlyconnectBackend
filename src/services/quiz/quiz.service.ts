import { NextFunction, Response } from "express";
import { generateError } from "../../config/Error/functions";
import { getAllQuiz, getAllQuizCategoryCount } from "../../repository/quiz.repository";
import { PaginationLimit } from "../../config/helper/constant";


export const getAllQuizService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = req.bodyData.company;
    req.body.page = req.query.page ? parseInt(req.query.page) : 1;
    req.body.limit = req.query.limit
      ? parseInt(req.query.limit)
      : PaginationLimit;
    const { status, data } = await getAllQuiz(req.body);
    if (status === "success") {
      res.status(200).send({
        data: data,
        message: "GET Quiz SUCCESSFULLY",
        status: "success",
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const getAllCategoryQuizCountService = async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    try {
      req.body.company = req.bodyData.company;
      const { status, data } = await getAllQuizCategoryCount(req.body);
      if (status === "success") {
        res.status(200).send({
          data: data,
          message: "GET Counts SUCCESSFULLY",
          status: "success",
        });
      } else {
        throw generateError(data,400);
      }
    } catch (err) {
      next(err);
    }
  }