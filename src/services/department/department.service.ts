import { NextFunction, Response } from "express";
import { createDepartmentCategory, createDepartment, getCategoryDepartmentCount, getCategoryDepartment } from "../../repository/department/department.repository";

export const createDepartmentCategoryService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.user = req.userId;
    req.body.company = req.bodyData.company;
    req.body.companyOrg = req.bodyData.companyOrg;
    const { status, data } = await createDepartmentCategory(req.body);
    if (status === "success") {
      res.status(200).send({
        status: status,
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};


export const createDepartmentService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.user = req.userId;
    req.body.company = req.bodyData.company;
    req.body.companyOrg = req.bodyData.companyOrg;
    const { status, data } = await createDepartment(req.body);
    if (status === "success") {
      res.status(200).send({
        status: status,
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
}


export const getCategoryDepartmentCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.user = req.userId;
    req.body.company = req.bodyData.company;
    req.body.companyOrg = req.bodyData.companyOrg;
    const { status, data } = await getCategoryDepartmentCount(req.body);
    if (status === "success") {
      res.status(200).send({
        status: status,
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
}

export const getCategoryDepartmentService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || undefined;
    const { data, status, totalPages } = await getCategoryDepartment({
      search: search,
      company: req.bodyData.company,
      companyOrg:req.bodyData.companyOrg,
      page: Number(page),
      limit: Number(limit),
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
}