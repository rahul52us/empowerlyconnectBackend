import {
  createBlog,
  getBlogById,
  getBlogs,
} from "../../repository/blog.repository";
import { generateError } from "../../config/Error/functions";
import { createBlogValidation, getBlogByIdValidation } from "./utils/validation";
import { NextFunction, Response } from "express";
import mongoose from "mongoose";

const createBlogService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = createBlogValidation.validate(req.body);
    if (error) {
      throw generateError(error.details, 422);
    }

    const response = await createBlog({
      ...value,
      createdBy: req.userId,
      company: req.bodyData.company,
    });

    if (response.status === "success") {
      res.status(201).send({
        data: response.data,
        success: true,
        message: `${value.title} blog has been created successfully`,
      });
    } else {
      next(response.data);
    }
  } catch (err: any) {
    next(err);
  }
};

const getBlogsService = async (req: any, res: Response, next: NextFunction) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10
    const { status, data } = await getBlogs({ page,limit });
    if (status === "success") {
      res.status(200).send({
        success: true,
        message: "Get Blogs successfully",
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

const getBlogByIdService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error } = getBlogByIdValidation.validate({blogId : req.params.blogId})
    if (error) {
      throw generateError(error.details, 422);
    }

    const { status, data } = await getBlogById({blogId : new mongoose.Types.ObjectId(req.params.blogId)});
    if (status === "success") {
      res.status(200).send({
        message: "GET BLOG SUCCESSFULLY",
        data: data,
        success: true,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export { createBlogService, getBlogsService, getBlogByIdService };
