import CompanyPolicy from "../../schemas/company/CompanyPolicy";
import Company from "../../schemas/company/Company";
import { statusCode } from "../../config/helper/statusCode";
import mongoose from "mongoose";
import { createCatchError } from "../../config/helper/function";
import companyHolidays from "../../schemas/company/companyHolidays";
import companyWorkLocations from "../../schemas/company/companyWorkLocations";
import companyWorkTiming from "../../schemas/company/companyWorkTiming";

export const getOrganisationCompanies = async (data: any) => {
  try {
    const pipeline: any = [];
    pipeline.push(
      {
        $match: {
          companyOrg: data.companyOrg,
          deletedAt: { $exists: false },
          is_active: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
          pipeline: [
            {
              $project: {
                username: 1,
                code: 1,
                role: 1,
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "activeUser",
          foreignField: "_id",
          as: "activeUser",
          pipeline: [
            {
              $project: {
                username: 1,
                code: 1,
                role: 1,
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      }
    );

    const companies = await Company.aggregate(pipeline);
    return {
      data: companies,
      message: "Retrieved Company successfully",
      statusCode: statusCode.success,
      status: "success",
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getCompanyDetailsByName = async (data: any) => {
  try {
    const company = await Company.findOne({
      company_name: new RegExp(data.company, "i"),
      is_active: true,
    });
    if (company) {
      return {
        status: "success",
        data: company,
        statusCode: 200,
      };
    } else {
      return {
        status: "error",
        data: `${data.company} No Such Are Found`,
        statusCode: 400,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err,
      statusCode: err.statusCode,
    };
  }
};

export const getHolidays = async (data: any) => {
  try {
    const holidays: any = await companyHolidays.find(data).sort({createdAt : -1});
    if (holidays) {
      return {
        status: "success",
        data: holidays || [],
        message: "Successfully retrieved holidays",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        message: "Policy not found",
        data: "Policy not found",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const getWorkLocations = async (data: any) => {
  try {
    const workLocations: any = await companyWorkLocations.find(data);
    if (workLocations) {
      return {
        status: "success",
        data: workLocations || [],
        message: "Successfully retrieved Locations",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        message: "Policy not found",
        data: "Policy not found",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const getWorkTiming = async (data: any) => {
  try {
    const workTiming: any = await companyWorkTiming.find(data);
    if (workTiming) {
      return {
        status: "success",
        data: workTiming || [],
        message: "Successfully retrieved Timings",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "success",
        message: "Policy not found",
        data: "Policy not found",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const updateHolidayByExcel = async (data: any) => {
  try {
    const policy: any = await CompanyPolicy.findOne({
      company: new mongoose.Types.ObjectId(data.company),
    });
    if (policy) {
      const updatedHolidays: any = await CompanyPolicy.findByIdAndUpdate(
        policy._id,
        { holidays: data.holidays }
      );
      return {
        status: "success",
        data: updatedHolidays.holidays || [],
        message: "Successfully retrieved Timings",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        message: "Policy not found",
        data: "Policy not found",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const updateHolidays = async (data: any) => {
  try {
    const policy: any = await CompanyPolicy.findOne({
      _id: data.policy,
      is_active: true,
    });

    if (!policy) {
      return {
        status: "success",
        message: "Policy not found",
        data: "Policy not found",
        statusCode: statusCode.info,
      };
    }

    if (data?.isAdd) {
      const holiday = new companyHolidays({
        title: data.title,
        description: data.description,
        date : data.date,
        policy: policy._id,
        company: policy.company,
      });
      const savedHoliday = await holiday.save();
      return {
        status: "success",
        data: savedHoliday,
        message: "Holiday have been updated successfully",
        statusCode: statusCode.success,
      };
    }

    if (data?.isEdit) {
      const holiday = await companyHolidays.findByIdAndUpdate(
        data._id,
        { $set: {...data} },
        { new: true }
      );
      return {
        status: "success",
        data: holiday,
        message: "Holiday have been updated successfully",
        statusCode: statusCode.success,
      };
    }

    if (data?.isDelete) {
      const holiday = await companyHolidays.findById(data._id);
      if (holiday) {
        const deletedHoliday = await holiday.deleteOne();
        return {
          status: "success",
          data: deletedHoliday,
          message: "Holiday delete successfully",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          data: "No Such holiday exists",
          message: "No Such holiday exists",
          statusCode: statusCode.success,
        };
      }
    }

    return {
      status: "error",
      data: "No success action exists",
      message: "No success action exists",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};

export const updateWorkTiming = async (data: any) => {
  try {
    const policy = await CompanyPolicy.findOne({ company: data.company });

    if (!policy) {
      return {
        status: "success",
        message: "Policy not found",
        data: null,
        statusCode: statusCode.info,
      };
    }

    const updatedWorkTiming = data.workTiming?.workTiming.map(
      (newTiming: any) => {
        const existingTiming = policy.workTiming.find(
          (timing: any) => timing._id.toString() === newTiming._id
        );
        if (existingTiming) {
          existingTiming.startTime = newTiming.startTime;
          existingTiming.endTime = newTiming.endTime;
          existingTiming.daysOfWeek = newTiming.daysOfWeek;
          return existingTiming;
        } else {
          return newTiming;
        }
      }
    );

    policy.workTiming = updatedWorkTiming;

    const savedPolicy = await policy.save();

    return {
      status: "success",
      data: savedPolicy.workTiming,
      message: "WorkTiming updated successfully",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};
export const updateWorkLocations = async (data: any) => {
  try {
    const policy: any = await CompanyPolicy.findById(data.policy);

    if (!policy) {
      return {
        status: "success",
        message: "Policy not found",
        data: null,
        statusCode: statusCode.info,
      };
    }

    if (data?.edit === 1) {
      const updatedWorkLocations = await companyWorkLocations.findByIdAndUpdate(data._id, {$set : data},{new : true})
      if (updatedWorkLocations) {
        return {
          status: "success",
          data: updateWorkLocations,
          message: "Location have been updated successfully",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          message: "The specified location does not exist",
          data: null,
          statusCode: statusCode.info,
        };
      }
    } else if (data?.delete === 1) {
      const deletedLocation = await companyWorkLocations.findByIdAndDelete(data?._id)
      if (deletedLocation) {
        return {
          status: "success",
          data: deletedLocation,
          message: "Locations has been Deleted",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          message: "The specified Locations does not exist",
          data: null,
          statusCode: statusCode.info,
        };
      }
    } else {
      const locations =  new companyWorkLocations(data)
      const savedLocations = await locations.save()
      return {
        status: "success",
        data: savedLocations,
        message: "Location has been added successfully",
        statusCode: statusCode.success,
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const uploadWorkLocationsByExcel = async (data: any) => {
  try {
    const policy: any = await CompanyPolicy.findOne({ company: data.company });

    if (!policy) {
      return {
        status: "success",
        message: "Policy not found",
        data: null,
        statusCode: statusCode.info,
      };
    }

    policy.workLocations = data?.workLocations;

    const savedPolicy = await policy.save();
    return {
      status: "success",
      data: savedPolicy.workLocations,
      message: "Locations updated successfully",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};
