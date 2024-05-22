import User from "../../schemas/User/User";
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

const createEmploye = async (data: any) => {
  try {
    const user = await User.findOne({ username: data.username });
    if (user) {
      throw generateError(`${user.username} user is already exists`, 400);
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
      user : savedUser._id,
      company:data.company,
      companyOrg:data.companyOrg,
      department:data.department,
      designation:data.designation,
      position:data.position,
      eType:data.eType,
      eCategory:data.eCategory,
      workingLocation:data.workingLocation,
      workTiming:data.workTiming,
      is_active:true
    })

    const savedComDetail = await comDetails.save()
    savedUser.companyDetail = await savedComDetail._id

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
        companyDetail: savedComDetail.toObject()
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
      is_active:true,
      deletedAt: { $exists: false },
      company:data.company
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

    let documentPipeline: any = [
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
}
;

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

const getTotalEmployes = async (data: any) => {
  try {
    const result = await CompanyDetails.aggregate([
      {
        $match: {
          ...data,
          is_active : true,
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

// UPDATE BANK DETAILS OF THE EMPLOYE

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
      docum.details.push(data.details)
      await docum.save();
      await updateUserRoleService(data.id, data.details.eType)
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

export const getManagerByCompany = () => {
  try
  {

  }
  catch(err)
  {

  }
}

export {
  createEmploye,
  updateEmployeProfileDetails,
  getEmployes,
  getEmployeById,
  getCountDesignationStatus,
  getTotalEmployes,
  updateBankDetails,
  updateFamilyDetails,
  updateWorkExperienceDetails,
  updateDocumentDetails,
  updateCompanyDetails
};
