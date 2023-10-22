import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import User from "../../schemas/User";
import { generateError } from "../config/function";
import dotenv from "dotenv";
import {
  UserValidation,
  changePasswordValidation,
  forgotEmailValidation,
  loginValidation,
  resetPasswordValidation,
} from "./utils/validation";
import generateToken, {
  generateResetPasswordToken,
} from "../config/generateToken";
import Company from "../../schemas/Company";
import Token from "../../schemas/Token/Token";
import ProfileDetails from "../../schemas/ProfileDetails";
import SendMail from "../config/sendMail/sendMail";
import { FORGOT_PASSWORD_EMAIL_TOKEN_TYPE, REGISTER_NEW_USER_TOKEN_TYPE } from "../config/sendMail/utils";

dotenv.config();
const MeUser = async (req: any, res: Response): Promise<any> => {
  const profile_details = await ProfileDetails.findById(
    req.bodyData.profile_details
  );
  return res.status(200).send({
    message: `get successfully data`,
    data: { ...req.bodyData, profile_details },
    statusCode: 201,
    success: true,
  });
};

const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const result = UserValidation.validate(req.body);
    if (result.error) {
      throw generateError(result.error.details, 422);
    }

    const existUser = await User.findOne({ username: req.body.username });
    if (existUser) {
      throw generateError(`${existUser.username} user already exists`, 400);
    }

    if (req.body.role !== "admin") {
      const selectedCompany = await Company.findOne({
        _id: req.body.company?.trim(),
        is_active: true,
      });
      if (!selectedCompany) {
        throw generateError(`Company does not exist`, 400);
      }

      const user = new User({
        username: req.body.username,
        name: req.body.name,
        password: req.body.password,
        company: selectedCompany._id,
        role: req.body.role,
        is_active: selectedCompany.verified_email_allowed ? false : true,
      });
      const savedUser = await user.save();
      if (!savedUser) {
        throw generateError(`Cannot create the user`, 400);
      }

      const profileDetail = new ProfileDetails({ user: savedUser._id });
      const createdProfileDetail = await profileDetail.save();

      savedUser.profile_details = createdProfileDetail._id;
      await savedUser.save();

      if (selectedCompany.verified_email_allowed) {
        const token = generateResetPasswordToken(savedUser._id);
        const storeToken = new Token({
          userId: savedUser._id,
          token: token,
          type : REGISTER_NEW_USER_TOKEN_TYPE
        });
        const sendMail: any = await SendMail(
          savedUser.name,
          savedUser.username,
          `${process.env.FRONTEND_BASE_URL}/verify-account/${token}`,
          'Register New User',
          'Register_email_templates.html'
        );

        if (!sendMail.success) {
          await savedUser.deleteOne();
          await profileDetail.deleteOne();
          await storeToken.deleteOne();
          throw generateError(
            `Failed to send mail to ${req.body.username} please try again later`,
            400
          );
        }

        return res.status(200).send({
          data: `Check your email and verify your ${user.username} account`,
          statusCode: 200,
          success: true,
          message: `Check your email and verify your ${user.username} account`,
        });
      } else {
        const { password, ...userData } = savedUser.toObject();
        const responseUser = {
          ...userData,
          authorization_token: generateToken({ userId: savedUser._id }),
        };
        return res.status(200).send({
          data: responseUser,
          statusCode: 200,
          success: true,
          message: `${user.username} account has been created for the ${selectedCompany.company_name} company`,
        });
      }
    } else {
      const user = new User({
        username: req.body.username,
        role: req.body.role,
        is_active: false,
      });
      const createdUser = await user.save();
      if (!createdUser) {
        throw generateError(`Cannot create the user`, 400);
      }

      const token = generateResetPasswordToken(createdUser._id);
      const storeToken = new Token({
        userId: createdUser._id,
        token: token,
        type:REGISTER_NEW_USER_TOKEN_TYPE
      });

      const savedToken = await storeToken.save();
      const sendMail: any = await SendMail(
        createdUser.username,
        createdUser.username,
        `${process.env.FRONTEND_BASE_URL}/verify-account/${token}`,
        "Verify Your Account",
        "Register_email_templates.html"
      );

      if (!sendMail.success) {
        await createdUser.deleteOne();
        await savedToken.deleteOne();
        throw generateError(
          `Failed to send mail to ${req.body.username} please try again later`,
          400
        );
      }

      return res.status(201).send({
        message: `${createdUser.username} account has been created. Please verify your account.`,
        data: `${createdUser.username} account has been created. Please verify your account.`,
        statusCode: 201,
        success: true,
      });
    }
  } catch (err) {
    next(err);
  }
};

const VerifyEmailToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = await Token.findOne({
      token: req.params.token,
    });
    if (token && token?.type === REGISTER_NEW_USER_TOKEN_TYPE) {
      const updatedData = await User.findByIdAndUpdate(
        token.userId,
        { $set: { is_active: true } },
        { new: true }
      );
      if (updatedData) {
        if(updatedData.role !== "admin"){
          await token.deleteOne()
        }
        res.status(200).send({
          message: `Account has been verified succesfully`,
          success: true,
          data: updatedData,
          statusCode: 200,
        });
      } else {
        throw generateError(`Invalid token or token has been expired`, 400);
      }
    } else {
      throw generateError(`Invalid token or token has been expired`, 400);
    }
  } catch (err) {
    next(err);
  }
};

const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const result = loginValidation.validate(req.body);
    if (result.error) {
      throw generateError(result.error.details, 422);
    }

    const existUser = await User.findOne({ username: req.body.username }).populate('profile_details');
    if (!existUser) {
      throw generateError(`${req.body.username} user does not exist`, 401);
    }

    const { password, ...userData } = existUser.toObject();
    if (password !== req.body.password) {
      throw generateError(`Invalid username and password`, 400);
    }

    const responseUser = {
      ...userData,
      authorization_token: generateToken({ userId: userData._id }),
    };

    res.status(200).send({
      message: `${existUser.username} user has been logged in successfully`,
      data: responseUser,
      statusCode: 200,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = forgotEmailValidation.validate(req.body);
    if (result.error) {
      throw generateError(result.error.details, 422);
    }

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
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

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = resetPasswordValidation.validate(req.body);
    if (result.error) {
      throw generateError(result.error.details, 422);
    }

    const token : any = await Token.findOne({ token: req.body.token });
    if (!token && token?.type !== FORGOT_PASSWORD_EMAIL_TOKEN_TYPE) {
      throw generateError(`Invalid token or token has expired`, 400);
    }

    const user = await User.findByIdAndUpdate(token.userId, {
      $set: { password: req.body.password },
    });

    if (!user) {
      throw generateError(`Invalid token or token has expired`, 400);
    }

    await token.deleteOne();
    await SendMail(
      user.name,
      user.username,
      `${process.env.FRONTEND_BASE_URL}`,
      "Password Changed Successfully!",
      "reset_email_templates.html"

    );

    res.status(200).send({
      message: `Password has been changed successfully`,
      data: `Password has been changed successfully`,
      statusCode: 200,
      success: true,
    });
  } catch (err: any) {
    next(err);
  }
};

// get company of the companys

const getUsersByCompany = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { is_active, position } = req.body;

    const query: any = {
      company: req.bodyData.company,
    };

    if (is_active !== undefined) {
      query.is_active = is_active;
    }

    if (position && position.length !== 0) {
      query.position = { $in: position };
    }

    const users = await User.find(query).select("-password");

    if (!users) {
      throw generateError("Something went wrong while fetching the users", 400);
    }

    res.status(200).send({
      message: "Fetch Users Successfully",
      data: users,
      statusCode: 200,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = changePasswordValidation.validate(req.body);

    if (result.error) {
      throw generateError(result.error.details, 422);
    }

    const user = await User.findById(req.userId);

    if (user) {
      if (!(user.password === req.body.oldPassword)) {
        throw generateError(
          `Current Password does not match to the Old Password`,
          400
        );
      }

      user.password = req.body.newPassword;
      await user.save();
      res.status(200).send({
        message: "Password Change Successfully",
        data: "Password Change Successfully",
        statusCode: 200,
        success: true,
      });
    }
  } catch (err) {
    next(err);
  }
};

const updateUserProfile = async (req: any, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userDataToUpdate = {
      name: req.body.firstName + " " + req.body.lastName,
      username: req.body.username,
      pic: req.body.pic,
      bio: req.body.bio,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      userDataToUpdate,
      { new: true }
    ).populate("profile_details").session(session);

    if (!updatedUser) {
      throw generateError('User does not exist', 400);
    }

    const profileDetailsId = updatedUser.profile_details;
    const profileDetailsDataToUpdate = {
      addressInfo: req.body.addressInfo,
      motherName:req.body.motherName,
      fatherName:req.body.fatherName,
      sibling:req.body.sibling,
      nickName:req.body.nickName,
      phoneNo:req.body.phoneNo,
      mobileNo:req.body.mobileNo,
      emergencyNo:req.body.emergencyNo
    };

    const updatedProfileDetails = await ProfileDetails.findByIdAndUpdate(
      profileDetailsId,
      profileDetailsDataToUpdate,
      { new: true }
    ).session(session);

    if (!updatedProfileDetails) {
      throw generateError('Profile details not found', 400);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({
      message: 'User and profile details updated successfully',
      data: { ...updatedUser.toObject(), profile_details: updatedProfileDetails.toObject() },
      statusCode: 200,
      status: 'success',
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};


export {
  createUser,
  loginUser,
  MeUser,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  changePassword,
  VerifyEmailToken,
  getUsersByCompany,
};