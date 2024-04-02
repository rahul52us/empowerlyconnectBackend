import { NextFunction, Response } from "express";
import User from "../../schemas/User/User";
import ProfileDetails from "../../schemas/User/ProfileDetails";
import BankDetails from "../../schemas/User/BankDetails";
import DocumentDetails from "../../schemas/User/Document";
import WorkExperience from "../../schemas/User/WorkExperience";
import { generateError } from "../../config/Error/functions";

const createEmploye = async (data: any) => {
  try {
    const user = await User.findOne({ username: data.username });
    if (user) {
      throw generateError(`${user.username} user is already exists`, 400);
    }

    const createdUser = new User({
      username: data.username,
      companyOrg:data.companyOrg,
      name: data.name,
      code: data.code,
      company: data.company,
      pic: data.pic,
      designation:data.designation,
      password: data.password,
      bio: data.bio,
      is_active: true,
      title:data.title
    });

    const savedUser = await createdUser.save();

    if (!savedUser) {
      throw generateError(`cannot create the user`, 400);
    }

    const profile = new ProfileDetails({
      user: savedUser._id,
      language: data.language,
      nickName: data.nickName,
      mobileNo: data.mobileNo,
      emergencyNo: data.emergencyNo,
      addressInfo: data.addressInfo,
      healthCardNo: data.healthCardNo,
      insuranceCardNo: data.insuranceCardNo,
      maritalStatus: data.maritalStatus,
      medicalCertificationDetails: data.medicalCertificationDetails,
      weddingDate: data.weddingDate,
      dob: data.weddingDate,
      aadharNo: data.aadharNo,
      panNo: data.panNo,
      pfUanNo: data.pfUanNo,
      personalEmail: data.personalEmail,
      refferedBy: data.refferedBy,
      bloodGroup: data.bloodGroup,
    });

    const savedProfile = await profile.save();
    savedUser.profile_details = savedProfile._id;
    await savedUser.save();
    const BankDetail = new BankDetails({
      user: savedUser._id,
    });
    const savedBank = await BankDetail.save();

    const WorkExperienceDetail = new WorkExperience({
      user: savedUser._id,
    });

    const savedWorkExperience = await WorkExperienceDetail.save();

    const documentDetails = new DocumentDetails({
      user: savedUser._id,
    });

    const savedDocument = await documentDetails.save();

    const { password, ...restUser } = savedUser.toObject();

    return {
      status: "success",
      data: {
        ...restUser,
        profile_details: savedProfile.toObject(),
        bankDetail: savedBank.toObject(),
        documentDetail: savedDocument.toObject(),
        WorkExperience: savedWorkExperience.toObject(),
      },
    };
  } catch (err: any) {
    return {
      status: "error",
      data: err,
    };
  }
};

const updateEmployeProfileDetails = async (data: any) => {
  try {
    const user = await User.findByIdAndUpdate(data.userId, { $set: data });
    const employe = await ProfileDetails.findOneAndUpdate(
      { user: data.userId },
      { $set: data }
    );
    if (!employe && !user) {
      return {
        status: "error",
        data: "User does not exists",
      };
    }
    return {
      status: "success",
      data: "User has been updated successfully",
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

const getEmployes = async (data: any) => {
  try {
    let matchConditions: any = {
      company: data.company,
      companyOrg:data.companyOrg,
      deletedAt: { $exists: false },
    };

    if (data.search) {
      matchConditions = { ...matchConditions, code: data.search?.trim() };
    }

    const pipeline: any = [
      {
        $match: {
          ...matchConditions,
        },
      },
      {
        $lookup: {
          from: "profiledetails",
          localField: "_id",
          foreignField: "user",
          as: "profileDetails",
        },
      },
    ];

    let documentPipeline: any = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (data.page - 1) * data.limit },
      { $limit: Number(data.limit) },
    ];

    const [resultData, countDocuments]: any = await Promise.all([
      User.aggregate(documentPipeline),
      User.aggregate([
        ...pipeline,
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalCounts = countDocuments.length > 0 ? countDocuments[0].count : 0;

    return {
      status: "success",
      data: resultData,
      totalPages: Math.ceil(totalCounts / data.limit),
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

const getEmployeById = async (data: any) => {
  try {
    const pipeline: any = [
      {
        $match: {
          _id: data.employeId,
          company: data.company,
          deletedAt: { $exists: false },
        },
      },
      {
        $lookup: {
          from: "profiledetails",
          localField: "_id",
          foreignField: "user",
          as: "profileDetails",
        },
      },
      {
        $lookup: {
          from: "bankdetails",
          localField: "_id",
          foreignField: "user",
          as: "bankDetails",
        },
      },
      {
        $lookup: {
          from: "documents",
          localField: "_id",
          foreignField: "user",
          as: "documents",
        },
      },
      {
        $lookup: {
          from: "workexperiences",
          localField: "_id",
          foreignField: "user",
          as: "workExperience",
        },
      },
    ];

    const employeData = await User.aggregate(pipeline);
    if (employeData.length === 1) {
      return {
        status: "success",
        data: employeData[0],
      };
    } else {
      return {
        status: "error",
        data: "User does not exists",
      };
    }
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

const getCountDesignationStatus = async (data: any) => {
  try {
    const designationCount = await User.aggregate([
      {
        $match: {
          company: data.company,
          companyOrg:data.companyOrg,
          deletedAt: { $exists: false },
        },
      },
      { $unwind: "$designation" },
      {
        $group: {
          _id: "$designation",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          designation: "$_id",
          count: 1
        }
      },
    ]);

    return {
      status: "success",
      data: designationCount,
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

const getTotalEmployes = async (data: any) => {
  try {
    const result = await User.aggregate([
      {
        $match: {
          ...data,
          deletedAt: { $exists: false },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      status: "success",
      data: result.length > 0 ? result[0].count : 0,
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};


export {
  createEmploye,
  updateEmployeProfileDetails,
  getEmployes,
  getEmployeById,
  getCountDesignationStatus,
  getTotalEmployes
};
