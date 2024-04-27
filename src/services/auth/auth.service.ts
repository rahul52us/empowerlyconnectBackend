import { NextFunction, Request, Response } from "express";
import { changePasswordValidation, forgotEmailValidation, loginValidation } from "./utils/validation";
import { generateError } from "../../config/Error/functions";
import { changePassword, findUserByUserName, loginUser } from "../../repository/auth.repository";
import SendMail from "../../config/sendMail/sendMail";
import { generateResetPasswordToken } from "../../config/helper/generateToken";
import { FORGOT_PASSWORD_EMAIL_TOKEN_TYPE } from "../../config/sendMail/utils";
import Token from "../../schemas/Token/Token";

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
      `${process.env.RESET_PASSWORD_LINK}/${resetData.token}`,
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


export { loginUserService, changePasswordService, forgotPasswordService };