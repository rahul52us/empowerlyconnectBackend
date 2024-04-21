import { Response, NextFunction } from "express";
import User from "../../schemas/User/User";
import Company from "../../schemas/company/Company";
import ProfileDetails from "../../schemas/User/ProfileDetails";
import { createValidation } from "./utils/validation";
import { generateError } from "../config/function";
import generateToken from "../config/generateToken";
import Token from "../../schemas/Token/Token";
import WorkExperience from "../../schemas/User/WorkExperience";
import BankDetails from '../../schemas/User/BankDetails'
import DocumentDetails from '../../schemas/User/Document'
import CompanyPolicy from "../../schemas/company/CompanyPolicy";
import CompanyDetails from "../../schemas/User/CompanyDetails";

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

    const existsComp = await Company.findOne({ company_name: new RegExp(req.body.company_name?.trim(), 'i') });
    if (existsComp) {
      throw generateError(
        `${existsComp.company_name} company already exists`,
        400
      );
    }

    const comp = new Company({
      company_name: req.body.company_name?.trim(),
    });

    const createdComp : any = await comp.save();

    createdComp.companyOrg = createdComp._id
    await createdComp.save()

    const compPolicy = new CompanyPolicy({
      company: createdComp._id,
      createdBy:user._id
    });

    const createdCompPolicy : any = await compPolicy.save();

    const profileDetail = new ProfileDetails({
      user: user._id
    });
    const createdProfileDetails = await profileDetail.save();

    const BankDetail = new BankDetails({
      user: user._id,
    });
    const savedBank = await BankDetail.save();

    const WorkExperienceDetail = new WorkExperience({
      user: user._id,
    });

    const savedWorkExperience = await WorkExperienceDetail.save();

    const documentDetails = new DocumentDetails({
      user: user._id
    });

    const savedDocument = await documentDetails.save();

    const companyDetails = new CompanyDetails({
      user: user._id,
      company:createdComp._id
    });

    const savedCompanyDetails = await companyDetails.save();

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          name: req.body.name,
          profile_details: createdProfileDetails._id,
          companyOrg:createdComp._id,
          company: createdComp._id,
          companyDetails: savedCompanyDetails._id,
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
        bankDetails:savedBank._id,
        documentDetails:savedDocument._id,
        workExperience:savedWorkExperience._id,
        companyPolicy:createdCompPolicy._id,
        authorization_token: generateToken({ userId: updatedUser._id }),
      },
      statusCode: 201,
      success: true,
    });
  } catch (err : any) {
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
