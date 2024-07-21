import { NextFunction, Response } from "express";
import { createUserValidation } from "./utils/validation";
import { generateError } from "../../config/Error/functions";
import {
  updateBankDetails,
  getCountDesignationStatus,
  getUserById,
  getUsers,
  getTotalUsers,
  updateUserProfileDetails,
  updateFamilyDetails,
  updateWorkExperienceDetails,
  updateDocumentDetails,
  updateCompanyDetails,
  getManagerUsers,
  getManagerUsersCounts,
  getUserInfoWithManagers,
  getUserInfoWithManagersAction,
  updatePermissions,
  getManagersOfUser,
  createUser,
  getRoleCountOfCompany,
} from "../../repository/employe/user.repository";
import mongoose from "mongoose";
import { getRoleUsersService } from "../auth/auth.service";
import { PaginationLimit } from "../../config/helper/constant";


// create the new User of the particular User
const createUserservice = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = createUserValidation.validate(req.body);
    if (error) {
      throw generateError(error.details, 422);
    }
    const { status, data } = await createUser({
      ...value,
      company: req.body.company,
      companyOrg: req.bodyData.companyOrg,
      createdBy: req.userId,
    });

    if (status === "success") {
      res.status(200).send({
        message: "CREATE User SUCCESSFULLY",
        statusCode: 201,
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

// update the User profile by the user id
const updateUserProfileService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, status } = await updateUserProfileDetails({
      userId: new mongoose.Types.ObjectId(req.params.id),
      ...req.body,
    });
    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};


// Get the Users of the particular company
const getAllEmploysService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || undefined;
    const { data, status, totalPages } = await getUsers({
      id: req.userId,
      search: search,
      company: new mongoose.Types.ObjectId(req.query.company),
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
};

// get the user details by the particular id
const getUserByIdService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data } = await getUserById({
      company: req.bodyData.company,
      UserId: new mongoose.Types.ObjectId(req.params._id),
    });
    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

// get the designation of the department of the particular company
const getCountDesignationStatusService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data } = await getCountDesignationStatus({
      company: new mongoose.Types.ObjectId(req.bodyData.company),
      companyOrg: req.bodyData.companyOrg,
    });
    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

// get the total numbers of users of the specific company
const getTotalUsersService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data } = await getTotalUsers({
      companyOrg: new mongoose.Types.ObjectId(req.bodyData.companyOrg),
    });
    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};


// update the bank details of the particular user
const updateBankDetialsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await updateBankDetails(req.body);
    if (status === "success") {
      res.status(201).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

// update the family details of the particular users
export const updateFamilyDetailsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await updateFamilyDetails(req.body);
    if (status === "success") {
      res.status(201).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

// update the workExperience of the particular users
const updateWorkExperienceService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await updateWorkExperienceDetails(req.body);
    if (status === "success") {
      res.status(201).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

// update the document of the particular users
const updateDocumentService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await updateDocumentDetails(req.body);
    if (status === "success") {
      res.status(201).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

// update the company details of the particular users
const updateCompanyDetailsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await updateCompanyDetails(req.body);
    if (status === "success") {
      res.status(201).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

// update the permission of the particular user by the user id
const updatePermissionsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await updatePermissions({id : req.body.id, permissions : req.body.permissions});
    if (status === "success") {
      res.status(201).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const getUserRoleUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const company = new mongoose.Types.ObjectId(req.query.company);
    const { status, statusCode, data }: any = await getRoleUsersService({
      company: company,
    });
    return res.status(statusCode).send({
      status,
      data,
    });
  } catch (err: any) {
    res.status(500).send({
      status: "error",
      data: err?.message,
    });
  }
};

// fetch the users of the managers
const getManagersEmploysService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search?.trim() || undefined;
    const { data, status, totalPages } = await getManagerUsers({
      id: req.userId,
      managers: [new mongoose.Types.ObjectId(req.params.id)],
      search: search,
      company: new mongoose.Types.ObjectId(req.query.company),
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
};

const getUserInfoWithManagerService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, status } = await getUserInfoWithManagers({
      username: req.body.username,
      code: req.body.code,
      company: new mongoose.Types.ObjectId(req.body.company),
      page: req.body.page || 1,
      limit: req.body.limit || 10,
      bloodGroup: req.body.bloodGroup || undefined,
      department: req.body.department || undefined,
    });

    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      return res.status(300).send({
        status: "error",
        data: data,
        message: data,
      });
    }
  } catch (err: any) {
    res.status(400).send({
      status: "error",
      data: err?.message,
      message: err?.message,
    });
  }
};

const getUserInfoWithManagerActionService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {

    const { data, status } = await getUserInfoWithManagersAction({
      userId: new mongoose.Types.ObjectId(req.params.id),
      company : new mongoose.Types.ObjectId(req.query.company),
      page : req.query.page ? Number(req.query.page) : 1,
      limit : req.query.limit ? Number(req.query.limit) : PaginationLimit
    });

    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      return res.status(300).send({
        status: "error",
        data: data,
        message: data,
      });
    }
  } catch (err: any) {
    res.status(400).send({
      status: "error",
      data: err?.message,
      message: err?.message,
    });
  }
};

const getManagerUsersCountsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, status } = await getManagerUsersCounts({
      id: req.userId,
      company: new mongoose.Types.ObjectId(req.query.company),
    });
    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      return res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err: any) {
    res.status(400).send({
      status: "error",
      data: err?.message,
    });
  }
};


const getManagersOfUserService = async (req : any , res : Response, next : NextFunction) => {
  try
  {
    const user = new mongoose.Types.ObjectId(req.params.userId)
    const {status, data} = await getManagersOfUser({user})
    if(status === "success"){
      res.status(200).send({
        status : status,
        data : data
      })
    }
    else {
      res.status(400).send({
        data,
        status
      })
    }
  }
  catch(err)
  {
    next(err)
  }
}

const getRoleCountOfCompanyService = async(req : any , res : Response, next : NextFunction) => {
  try
  {
    req.body.company = new mongoose.Types.ObjectId(req.query.company)
    const {data, status, statusCode, message} = await getRoleCountOfCompany(req.body)
    return res.status(statusCode).send({
      data,
      status,
      message
    })
  }
  catch(err : any)
  {
    next(err)
  }
}


export {
  createUserservice,
  updateUserProfileService,
  getAllEmploysService,
  getUserByIdService,
  getCountDesignationStatusService,
  getTotalUsersService,
  updateBankDetialsService,
  updateWorkExperienceService,
  updateDocumentService,
  updatePermissionsService,
  updateCompanyDetailsService,
  getManagersEmploysService,
  getManagerUsersCountsService,
  getUserInfoWithManagerService,
  getUserInfoWithManagerActionService,
  getManagersOfUserService,
  getRoleCountOfCompanyService
};
