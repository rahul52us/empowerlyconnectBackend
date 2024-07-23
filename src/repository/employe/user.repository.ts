import ProfileDetails from "../../schemas/User/ProfileDetails";
import BankDetails from "../../schemas/User/BankDetails";
import DocumentDetails from "../../schemas/User/Document";
import WorkExperience from "../../schemas/User/WorkExperience";
import { generateError } from "../../config/Error/functions";
import { deleteFile, uploadFile } from "../uploadDoc.repository";
import FamilyDetails from "../../schemas/User/FamilyDetails";
import Documents from "../../schemas/User/Document";
import CompanyDetails from "../../schemas/User/CompanyDetails";
import { updateUserRoleService } from "../../services/auth/auth.service";
import mongoose from "mongoose";
import User from "../../schemas/User/User";
import { createCatchError } from "../../config/helper/function";

const createUser = async (data: any) => {
  try {
    const user = await User.findOne({ username: data.username });
    if (user) {
      throw generateError(`${user.username} user is already exists`, 300);
    }

    const userCode = await User.findOne({ code: data.code });
    if (userCode) {
      throw generateError(
        `${userCode.username} is already exists with ${data.code}`,
        300
      );
    }

    const createdUser = new User({
      username: data.username,
      companyOrg: data.companyOrg,
      name: data.name,
      code: data.code,
      pic: data.pic,
      designation: data.designation,
      password: data.password,
      bio: data.bio,
      is_active: true,
      title: data.title,
    });

    const savedUser = await createdUser.save();

    if (!savedUser) {
      throw generateError(`cannot create the user`, 400);
    }

    const comDetails = new CompanyDetails({
      user: savedUser._id,
      company: data.company,
      companyOrg: data.companyOrg,
      department: data.department,
      designation: data.designation,
      position: data.position,
      eType: data.eType,
      eCategory: data.eCategory,
      workingLocation: data.workingLocation,
      workTiming: data.workTiming,
      is_active: true,
    });

    const savedComDetail = await comDetails.save();
    savedUser.companyDetail = await savedComDetail._id;

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
      dob: data.dob,
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

    const FamilyDetail = new FamilyDetails({
      user: savedUser._id,
    });
    const savedFamilyDetail = await FamilyDetail.save();

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
        FamilyDetail: savedFamilyDetail.toObject(),
        companyDetail: savedComDetail.toObject(),
      },
    };
  } catch (err: any) {
    return {
      status: "error",
      data: err,
    };
  }
};

const updateUserProfileDetails = async (data: any) => {
  try {
    const users = await User.findByIdAndUpdate(data.userId, { $set: data });
    const Users = await ProfileDetails.findOneAndUpdate(
      { user: data.userId },
      { $set: data }
    );
    if (!User && !users) {
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

const getUsers = async (data: any) => {
  try {
    let matchConditions: any = {
      is_active: true,
      deletedAt: { $exists: false },
      company: data.company,
    };

    const pipeline: any = [
      {
        $match: {
          ...matchConditions,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $lookup: {
          from: "profiledetails",
          localField: "userData.profile_details",
          foreignField: "_id",
          as: "profileDetails",
        },
      },
    ];

    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });

    if (data.search) {
      const searchRegex = new RegExp(data.search.trim(), "i");
      pipeline.push({
        $match: {
          $or: [
            { "userData.username": { $regex: searchRegex } },
            { "userData.code": { $regex: searchRegex } },
          ],
        },
      });
    }

    let documentPipeline: any = [
      ...pipeline,
      { $skip: (data.page - 1) * data.limit },
      { $limit: Number(data.limit) },
    ];

    const [resultData, countDocuments]: any = await Promise.all([
      CompanyDetails.aggregate(documentPipeline),
      CompanyDetails.aggregate([
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


const getUserById = async (data: any) => {
  try {
    const pipeline: any = [
      {
        $match: {
          _id: data.UserId,
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
          from: "familydetails",
          localField: "_id",
          foreignField: "user",
          as: "familyDetails",
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
      {
        $lookup: {
          from: "companydetails",
          localField: "_id",
          foreignField: "user",
          as: "companyDetail",
        },
      },
    ];

    const UserData = await User.aggregate(pipeline);
    if (UserData.length === 1) {
      return {
        status: "success",
        data: UserData[0],
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
          companyOrg: data.companyOrg,
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
          count: 1,
        },
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

const getTotalUsers = async (data: any) => {
  try {
    const result = await CompanyDetails.aggregate([
      {
        $match: {
          ...data,
          is_active: true,
          deletedAt: { $exists: false },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
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

// UPDATE BANK DETAILS OF THE User

const updateBankDetails = async (data: any) => {
  try {
    const { cancelledCheque, ...rest } = data;
    const updatedData: any = await BankDetails.findOneAndUpdate(
      { user: data.id },
      rest,
      {
        new: true,
      }
    );

    if (!updatedData) {
      return {
        status: "error",
        data: "bank Details does not exist",
      };
    }

    if (
      data?.cancelledCheque?.isFileDeleted === 1 &&
      updatedData.cancelledCheque?.name
    ) {
      await deleteFile(updatedData.cancelledCheque.name);
      updatedData.cancelledCheque = {
        name: undefined,
        url: undefined,
        type: undefined,
      };
      await updatedData.save();
    }

    if (
      data.cancelledCheque &&
      data.cancelledCheque?.isAdd === 1 &&
      data.cancelledCheque?.filename &&
      data.cancelledCheque?.buffer
    ) {
      const { filename, type } = data.cancelledCheque;
      const url = await uploadFile(data.cancelledCheque);
      updatedData.cancelledCheque = {
        name: filename,
        url,
        type,
      };
      await updatedData.save();
    }

    return {
      status: "success",
      data: updatedData,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};

const updatePermissions = async (data: any) => {
  try {
    const updatedData: any = await User.findByIdAndUpdate(
      data.id,
      {permissions : data.permissions},
      {
        new: true,
      }
    );

    if (!updatedData) {
      return {
        status: "error",
        data: "User does not exist",
      };
    }

    return {
      status: "success",
      data: updatedData,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};


const updateFamilyDetails = async (data: any) => {
  try {
    const updatedData: any = await FamilyDetails.findOneAndUpdate(
      { user: data.id },
      data,
      {
        new: true,
      }
    );

    if (!updatedData) {
      return {
        status: "error",
        data: "Family Details does not exist",
      };
    }

    return {
      status: "success",
      data: updatedData,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};

const updateWorkExperienceDetails = async (data: any) => {
  try {
    let rest = data.experienceDetails;
    let workExperience: any = await WorkExperience.findOne({ user: data.id });
    if (workExperience) {
      for (var i = 0; i < rest.length; i++) {
        try {
          if (
            rest[i].certificate &&
            rest[i].certificate?.buffer &&
            rest[i].certificate.isAdd === 1
          ) {
            const { filename, type, isFileDeleted } = rest[i].certificate;
            const url = await uploadFile(rest[i].certificate);
            rest[i].certificate = {
              name: filename,
              url,
              type,
              isFileDeleted: isFileDeleted,
            };
          }

          if (
            rest[i].certificate.isFileDeleted === 1 &&
            workExperience.experienceDetails[i]?.certificate
          ) {
            await deleteFile(
              workExperience.experienceDetails[i].certificate?.name
            );
          }
        } catch (error) {}
      }
      const updatedData: any = await WorkExperience.findOneAndUpdate(
        { user: data.id },
        { experienceDetails: rest },
        {
          new: true,
        }
      );
      return {
        status: "success",
        data: updatedData,
      };
    } else {
      return {
        status: "error",
        data: "WorkExperience Details does not exists",
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

async function uploadDocument(originalDoc: any, data: any, fieldName: string) {
  try {
    if (
      data[fieldName] &&
      data[fieldName]?.isAdd === 1 &&
      data[fieldName]?.filename &&
      data[fieldName]?.buffer
    ) {
      const { filename, type } = data[fieldName];
      const url = await uploadFile(data[fieldName]);
      return { name: filename, url, type, validTill: "", effectiveFrom: "" };
    }
    if (
      data[fieldName] &&
      data[fieldName]?.isDeleted === 1 &&
      originalDoc[fieldName]
    ) {
      const deleted = await deleteFile(originalDoc[fieldName]?.name);
      return null;
    }
    return originalDoc[fieldName];
  } catch (error: any) {
    return null;
  }
}

async function updateDocumentDetails(data: any) {
  try {
    const docum = await Documents.findOne({ user: data.id });
    if (docum) {
      const { documents } = data;
      const documentFields = Object.keys(documents);
      let uploadedDocuments: { [key: string]: any } = {};

      for (const fieldName of documentFields) {
        const documentInfo = await uploadDocument(
          docum.documents,
          documents,
          fieldName
        );
        if (documentInfo) {
          uploadedDocuments[fieldName] = {
            name: String(documentInfo.name),
            url: String(documentInfo.url),
            type: String(documentInfo.type),
            validTill: documentInfo.validTill,
            effectiveFrom: documentInfo.effectiveFrom,
          };
        }
      }
      docum.documents = uploadedDocuments;
      await docum.save();
      return {
        status: "success",
        data: docum,
      };
    } else {
      return {
        status: "error",
        data: "Documents do not exist",
      };
    }
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
}

async function updateCompanyDetails(data: any) {
  try {
    const docum = await CompanyDetails.findOne({ user: data.id });
    if (docum) {
      docum.details.push(data.details);
      await docum.save();
      await updateUserRoleService(data.id, data.details.eType);
      return {
        status: "success",
        data: docum,
      };
    } else {
      return {
        status: "error",
        data: "Company Details do not exist",
      };
    }
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
}

export const getManagerUsers = async (data: any) => {
  try {
    let matchConditions: any = {
      is_active: true,
      deletedAt: { $exists: false },
      company: data.company,
    };

    const pipeline: any = [
      {
        $match: matchConditions,
      },
      {
        $addFields: {
          details: { $arrayElemAt: ["$details", -1] },
        },
      },
      {
        $match: {
          "details.managers": { $in: data.managers },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $lookup: {
          from: "departments",
          localField: "details.designation",
          foreignField: "_id",
          as: "designation",
        },
      },
    ];

    if (data.search) {
      const searchRegex = new RegExp(data.search.trim(), "i");
      pipeline.push({
        $match: {
          $or: [
            { "userData.username": { $regex: searchRegex } },
            { "userData.code": { $regex: searchRegex } },
          ],
        },
      });
    }

    const documentPipeline: any = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (data.page - 1) * data.limit },
      { $limit: Number(data.limit) },
    ];

    const [resultData, countDocuments]: any = await Promise.all([
      CompanyDetails.aggregate(documentPipeline),
      CompanyDetails.aggregate([
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

const getManagerUsersCounts = async (data: any) => {
  try {
    let matchConditions: any = {
      is_active: true,
      deletedAt: { $exists: false },
      company: data.company,
    };

    const pipeline: any = [
      {
        $match: matchConditions,
      },
      {
        $addFields: {
          details: { $arrayElemAt: ["$details", -1] },
        },
      },
      {
        $unwind: "$details.managers",
      },
      {
        $group: {
          _id: "$details.managers",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "managerDetails",
        },
      },
      {
        $unwind: "$managerDetails",
      },
      {
        $addFields: {
          title: {
            $concat: [
              "$managerDetails.name",
              " ",
              "(",
              "$managerDetails.code",
              ")",
            ],
          },
        },
      },
      {
        $project: {
          managerDetails: 0,
        },
      },
    ];

    const resultData = await CompanyDetails.aggregate(pipeline).exec();

    return {
      status: "success",
      data: resultData,
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

export const getUserInfoWithManagers = async (data: any) => {
  try {
    const matchCriteria: any = {};

    if (data.username) {
      matchCriteria.username = { $regex: data.username, $options: "i" };
    }

    if (data.code) {
      matchCriteria.code = data.code;
    }

    const pipeline: any = [
      {
        $match: matchCriteria,
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
        $unwind: "$profileDetails",
      },
      {
        $lookup: {
          from: "companydetails",
          localField: "companyDetail",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $unwind: "$company",
      },
      {
        $addFields: {
          company_details: { $arrayElemAt: ["$company.details", -1] },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "company_details.designation",
          foreignField: "_id",
          as: "designation",
        },
      },
      {
        $lookup: {
          from: "departmentcategories",
          localField: "company_details.department",
          foreignField: "_id",
          as: "departmentCategory",
        },
      },
      {
        $project: {
          password: 0,
          company: 0,
        },
      },
    ];

    if (data.bloodGroup) {
      pipeline.splice(3, 0, {
        $match: { "profileDetails.bloodGroup": data.bloodGroup },
      });
    }

    if (data.designation) {
      pipeline.push({
        $match: {
          "company_details.designation": new mongoose.Types.ObjectId(
            data.designation
          ),
        },
      });
    }

    if (data.department) {
      pipeline.push({
        $match: {
          "company_details.department": new mongoose.Types.ObjectId(
            data.department
          ),
        },
      });
    }

    const datas = await User.aggregate(pipeline).exec();
    return {
      status: "success",
      data: datas,
    };
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message || "An error occurred",
    };
  }
};

export const getUserInfoWithManagersAction = async (data: any) => {
  try {
    const page = data.page
    const limit = data.limit
    const skip = (page - 1) * limit;

    const pipeline: any = [
      {
        $match: {
          _id: data.userId
        },
      },
      {
        $lookup: {
          from: "profiledetails",
          localField: "_id",
          foreignField: "user",
          as: "profiledetails",
        },
      },
      {
        $lookup: {
          from: "companydetails",
          localField: "companyDetail",
          foreignField: "_id",
          as: "companydetail",
        },
      },
      {
        $unwind: "$companydetail",
      },
      {
        $addFields: {
          companydetail: { $arrayElemAt: ["$companydetail.details", -1] },
        },
      },
      {
        $unwind: "$companydetail.managers",
      },
      {
        $lookup: {
          from: "departments",
          localField: "companydetail.designation",
          foreignField: "_id",
          as: "designation",
        },
      },
      {
        $lookup: {
          from: "departmentcategories",
          localField: "companydetail.department",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { managerId: "$companydetail.managers" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$managerId"],
                },
              },
            },
            {
              $project: {
                name: 1,
                username: 1,
                code: 1,
                title: 1,
              },
            },
          ],
          as: "managerDetails",
        },
      },
      {
        $project: {
          name: 1,
          username: 1,
          code: 1,
          title: 1,
          'designation.title': 1,
          'department.title': 1,
          profiledetails: 1,
          managerDetails: 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    const userPipeline: any = [
      {
        $lookup: {
          from: "companydetails",
          localField: "companyDetail",
          foreignField: "_id",
          as: "companydetail",
        },
      },
      {
        $unwind: "$companydetail",
      },
      {
        $addFields: {
          companydetail: { $arrayElemAt: ["$companydetail.details", -1] },
        },
      },
      {
        $match: {
          "companydetail.managers": { $elemMatch: { $eq: data.userId } },
        },
      },
      {
        $lookup: {
          from: "departmentcategories",
          localField: "companydetail.department",
          foreignField: "_id",
          as: "companydetail.department",
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "companydetail.designation",
          foreignField: "_id",
          as: "companydetail.designation",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          "userDetails.name": 1,
          "userDetails.username": 1,
          "userDetails.code": 1,
          "userDetails.title": 1,
          'companydetail.designation': 1,
          'companydetail.department': 1,
          'companydetail.doj': 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    const [userDetails, users] = await Promise.all([
      User.aggregate(pipeline),
      User.aggregate(userPipeline),
    ]);

    return {
      status: "success",
      data: { userDetails, users, page, limit },
    };
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message || "An error occurred",
    };
  }
};

// get the managers of the particular users
const getManagersOfUser = async (data: any) => {
  try {
    const pipeline = [
      {
        $match: { _id: data.user },
      },
      {
        $lookup: {
          from: "companydetails",
          localField: "companyDetail",
          foreignField: "_id",
          as: "companydetail",
        },
      },
      {
        $unwind: "$companydetail",
      },
      {
        $project: {
          managers: {
            $arrayElemAt: ["$companydetail.details.managers", -1],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "managers",
          foreignField: "_id",
          as: "managerDetails",
        },
      },
      {
        $project: {
          managers: {
            $map: {
              input: "$managerDetails",
              as: "manager",
              in: {
                _id: "$$manager._id",
                username: "$$manager.username"
              }
            }
          }
        }
      }
    ];

    const managers = await User.aggregate(pipeline);
    return {
      status: 'success',
      data: managers,
    };
  } catch (err: any) {
    return {
      status: 'error',
      message: err?.message || 'An unknown error occurred',
    };
  }
};

export const getRoleCountOfCompany = async(data:any) => {
  try {
    const { company } = data;

    const pipeline: any = [];

    pipeline.push({
      $match: {
        deletedAt: { $exists: false }
      }
    });

    pipeline.push({
      $lookup: {
        from: "companydetails",
        localField: "companyDetail",
        foreignField: "_id",
        as: "companydetail",
      },
    });

    pipeline.push({
      $unwind: "$companydetail",
    });

    pipeline.push({
      $match: {
        "companydetail.company": company
      }
    });

    pipeline.push({
      $project: {
        lastDetail: {
          $arrayElemAt: ["$companydetail.details", -1],
        },
      },
    });

    pipeline.push({
      $group: {
        _id: "$lastDetail.eType",
        count: { $sum: 1 }
      }
    });

    const result = await User.aggregate(pipeline);
    return {
      status: 'success',
      data: result,
      message: 'Retrieved Role Counts Successfully',
      statusCode: 200
    };
  } catch (err: any) {
    return createCatchError(err);
  }
}
;



export {
  createUser,
  updateUserProfileDetails,
  getUsers,
  getUserById,
  getCountDesignationStatus,
  getTotalUsers,
  updateBankDetails,
  updateFamilyDetails,
  updateWorkExperienceDetails,
  updateDocumentDetails,
  updateCompanyDetails,
  updatePermissions,
  getManagerUsersCounts,
  getManagersOfUser
};
/*
[
  {
    $match: {
      _id: ObjectId("6625148891c8094c277f4d83"),
      deletedAt: { $exists: false }
    }
  },
  {
    $lookup: {
      from: "profiledetails",
      localField: "_id",
      foreignField: "user",
      as: "profiledetails"
    }
  },
  {
    $lookup: {
      from: "bankdetails",
      localField: "_id",
      foreignField: "user",
      as: "bankDetails"
    }
  },
  {
    $lookup: {
      from: "companydetails",
      localField: "_id",
      foreignField: "user",
      as: "companydetails"
    }
  },
  {
    $unwind: {
      path: "$companydetails",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $unwind: {
      path: "$companydetails.details",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $lookup: {
      from: "departments",
      localField: "companydetails.details.designation",
      foreignField: "_id",
      as: "designationDetails"
    }
  },
  {
    $lookup: {
      from: "departmentcategories",
      localField: "companydetails.details.department",
      foreignField: "_id",
      as: "departmentDetails"
    }
  },
  {
    $lookup: {
      from: "users",
      let: { managerIds: "$companydetails.details.managers" },
      pipeline: [
        { $match: { $expr: { $in: ["$_id", "$$managerIds"] } } },
        { $project: { username: 1, code: 1, _id: 1 } }
      ],
      as: "managerDetails"
    }
  },
  {
    $lookup: {
      from: "companypolicies",
      localField: "companydetails.company",
      foreignField: "company",
      as: "companyPolicy"
    }
  },
  {
    $unwind: {
      path: "$companyPolicy",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $addFields: {
      "companydetails.details.designationDetails": {
        $arrayElemAt: ["$designationDetails", 0]
      },
      "companydetails.details.departmentDetails": {
        $arrayElemAt: ["$departmentDetails", 0]
      },
      "companydetails.details.managerDetails": "$managerDetails",
      "companydetails.details.workLocationDetails": {
        $map: {
          input: "$companydetails.details.workingLocation",
          as: "locId",
          in: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$companyPolicy.workLocations",
                  as: "workLoc",
                  cond: { $eq: ["$$workLoc._id", "$$locId"] }
                }
              },
              0
            ]
          }
        }
      },
      "companydetails.details.workTimingDetails": {
        $map: {
          input: "$companydetails.details.workTiming",
          as: "timeId",
          in: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$companyPolicy.workTiming",
                  as: "workTime",
                  cond: { $eq: ["$$workTime._id", "$$timeId"] }
                }
              },
              0
            ]
          }
        }
      }
    }
  },
  {
    $group: {
      _id: {
        userId: "$_id",
        detailId: "$companydetails.details._id"
      },
      profileDetails: { $first: "$profiledetails" },
      companydetails: { $first: "$companydetails" },
      bankDetails: { $first: "$bankDetails" },
      details: {
        $push: {
          _id: "$companydetails.details._id",
          doj: "$companydetails.details.doj",
          confirmationDate: "$companydetails.details.confirmationDate",
          managers: "$companydetails.details.managerDetails",
          department: "$companydetails.details.departmentDetails",
          designation: "$companydetails.details.designationDetails",
          workingLocation: "$companydetails.details.workLocationDetails",
          eType: "$companydetails.details.eType",
          description: "$companydetails.details.description",
          workTiming: "$companydetails.details.workTimingDetails",
          createdAt: "$companydetails.details.createdAt"
        }
      }
    }
  },
  {
    $group: {
      _id: "$_id.userId",
      profileDetails: { $first: "$profileDetails" },
      companydetails: { $first: "$companydetails" },
      bankDetails: { $first: "$bankDetails" },
      details: { $first: "$details" }
    }
  },
  {
    $unwind: "$details"
  },
  {
    $replaceRoot: {
      newRoot: {
        _id: "$_id",
        profileDetails: "$profileDetails",
        companydetails: "$companydetails",
        bankDetails: "$bankDetails",
        details: "$details"
      }
    }
  },
  {
    $group: {
      _id: "$_id",
      profileDetails: { $first: "$profileDetails" },
      companydetails: { $first: "$companydetails" },
      bankDetails: { $first: "$bankDetails" },
      details: { $push: "$details" }
    }
  }
]
*/