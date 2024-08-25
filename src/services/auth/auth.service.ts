import { NextFunction, Request, Response } from "express";
import { changePasswordValidation, forgotEmailValidation, loginValidation } from "./utils/validation";
import { generateError } from "../../config/Error/functions";
import { changePassword, findUserByUserName, getRoleUsers, loginUser, updateUserRole } from "../../repository/auth/auth.repository";
import SendMail from "../../config/sendMail/sendMail";
import { generateResetPasswordToken } from "../../config/helper/generateToken";
import { FORGOT_PASSWORD_EMAIL_TOKEN_TYPE } from "../../config/sendMail/utils";
import Token from "../../schemas/Token/Token";
import { baseURL } from "../../config/helper/urls";
import mongoose from "mongoose";

const loginUserService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const result = loginValidation.validate(req.body);
    if (result.error) {
      throw generateError(result.error.details, 422);
    }

    const { status, data, message } = await loginUser(req.body);
    if (status === "success") {
      res.status(200).send({
        message: message,
        data: data,
        statusCode: 200,
        success: true,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

const changePasswordService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = changePasswordValidation.validate(req.body);

    if (result.error) {
      throw generateError(result.error.details, 422);
    }

    const { status, data } = await changePassword({
      ...req.body,
      user: req.userId,
    });

    if (status === "success") {
      res.status(200).send({
        message: "Password Change Successfully",
        data: "Password Change Successfully",
        success: true,
      });
    } else {
      throw generateError(data, 400);
    }
  } catch (err) {
    next(err);
  }
};

const forgotPasswordService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = forgotEmailValidation.validate(req.body);
    if (result.error) {
      throw generateError(result.error.details, 422);
    }

    const user = await findUserByUserName({username : req.body.username})

    if(!user){
      throw generateError(`${req.body.username} email does not exist`, 400);
    }

    const resetData = new Token({
      userId: user.id,
      token: generateResetPasswordToken(user.id),
      type:FORGOT_PASSWORD_EMAIL_TOKEN_TYPE
    });

    const savedData = await resetData.save();
    if (!savedData) {
      throw generateError(`Cannot send the mail. Please try again later`, 400);
    }

      const sendMail: any = await SendMail(
      user.name,
      user.username,
      `${baseURL}/reset-password/${resetData.token}`,
      "We received a request to reset your password. If you didn't initiate this request, please disregard this email for security.",
      'Reset Your Password',
      'forgot_email_templates.html'
    );

    if (!sendMail.success) {
      await resetData.deleteOne();
      throw generateError(`Cannot send the mail. Please try again later`, 400);
    }

    res.status(200).send({
      message: `Link has been sent to ${req.body.username} email`,
      data: `Link has been sent to ${req.body.username} email`,
      statusCode: 200,
      success: true,
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateUserRoleService = async(id : string, role : string) => {
  try
  {
    const {status, data} = await updateUserRole(id, role)
    return {
      status : status,
      data : data
    }
  }
  catch(err : any)
  {
    return {
      status : 'error',
      data : err?.message
    }
  }
}

const getRoleUsersService = async(company : any) => {
  try
  {
    const {statusCode, status, data} = await getRoleUsers(company)
    return {
      statusCode,
      status,
      data
    }
  }
  catch(err : any)
  {
    return {
      status : 'error',
      statusCode : 500,
      data : err?.message
    }
  }
}

export { loginUserService, changePasswordService, forgotPasswordService, getRoleUsersService };