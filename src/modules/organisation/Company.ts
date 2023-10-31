import { Response, NextFunction } from "express";
import dotenv from "dotenv";
import User from "../../schemas/User";
import Company from "../../schemas/Company";
import ProfileDetails from "../../schemas/ProfileDetails";
import { createValidation } from "./utils/validation";
import { generateError } from "../config/function";
import generateToken from "../config/generateToken";
import Token from "../../schemas/Token/Token";

dotenv.config();

const createCompany = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = createValidation.validate(req.body);
    if (result.error) {
      throw generateError(result.error.details, 422);
    }

    const token = await Token.findOne({ token: req.query.token });
    if (!token) {
      throw generateError("Invalid token or token has expired", 400);
    }

    const user = await User.findById(token.userId);
    if (!user || user?.role !== "admin") {
      throw generateError("Invalid token or token has expired", 400);
    }

    const existsComp = await Company.findOne({
      company_name: req.body.company_name,
    });
    if (existsComp) {
      throw generateError(
        `${existsComp.company_name} company already exists`,
        400
      );
    }

    const comp = new Company({
      company_name: req.body.company_name,
    });

    const createdComp = await comp.save();

    const profileDetail = new ProfileDetails({
      user: user._id,
    });
    const createdProfileDetails = await profileDetail.save();

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          name: req.body.name,
          profile_details: createdProfileDetails._id,
          company: createdComp._id,
          password: req.body.password,
        },
      },
      { new: true }
    )
      .populate("profile_details")
      .populate("company");

    if (!updatedUser) {
      throw generateError("Something went wrong, contact administration", 400);
    }

    await token.deleteOne();

    const { password, ...rest } = updatedUser.toObject();
    return res.status(201).send({
      message: `${comp.company_name} company has been created successfully`,
      data: {
        ...rest,
        authorization_token: generateToken({ userId: updatedUser._id }),
      },
      statusCode: 201,
      success: true,
    });
  } catch (err : any) {
    console.log(err.message)
    next(err);
  }
};

const filterCompany = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await Company.findOne({
      company_name: req.query?.company?.trim(),
    });
    if (result) {
      throw generateError(
        `${req.query.company} company is not allowed`,
        400
      );
    }
    res.status(200).send({
      message: `${req.query.company} company is allowed`,
      data: `${req.query.company} company is allowed`,
      statusCode: 200,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export { createCompany, filterCompany };
