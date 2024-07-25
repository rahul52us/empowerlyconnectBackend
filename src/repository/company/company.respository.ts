import CompanyPolicy from "../../schemas/company/CompanyPolicy";
import Company from "../../schemas/company/Company";
import { statusCode } from "../../config/helper/statusCode";
import mongoose from "mongoose";
import { createCatchError } from "../../config/helper/function";

export const getOrganisationCompanies  = async(data : any) => {
  try
  {
    const pipeline : any = []
    pipeline.push({
      $match : {
        companyOrg : data.companyOrg,
        deletedAt : {$exists : false},
        is_active : true
      },
    },
    {
      $sort : {
        createdAt : -1
      }
    })

    const companies = await Company.aggregate(pipeline)
    return {
      data : companies,
      message : 'Retrieved Company successfully',
      statusCode : statusCode.success,
      status : 'success'
    }
  }
  catch(err : any)
  {
    return createCatchError(err)
  }
}

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
    const policy: any = await CompanyPolicy.findOne({
      company: new mongoose.Types.ObjectId(data.company),
    });
    if (policy) {
      return {
        status: "success",
        data: policy.holidays || [],
        message: "Successfully retrieved holidays",
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

export const getWorkLocations = async (data: any) => {
  try {
    const policy: any = await CompanyPolicy.findOne({
      company: new mongoose.Types.ObjectId(data.company),
    });
    if (policy) {
      return {
        status: "success",
        data: policy.workLocations || [],
        message: "Successfully retrieved Locations",
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

export const getWorkTiming = async (data: any) => {
  try {
    const policy: any = await CompanyPolicy.findOne({
      company: new mongoose.Types.ObjectId(data.company),
    });
    if (policy) {
      return {
        status: "success",
        data: policy.workTiming || [],
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

export const updateHolidays = async (data: any) => {
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

    if (data?.holidays?.edit === 1) {
      const index = policy.holidays.findIndex(
        (item: any) => item.title === data.holidays?.oldTitle
      );

      if (index !== -1) {
        policy.holidays[index] = data.holidays;
        const savedPolicy = await policy.save();

        return {
          status: "success",
          data: savedPolicy.holidays,
          message: "Holidays have been updated successfully",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          message: "The specified holiday does not exist",
          data: null,
          statusCode: statusCode.info,
        };
      }
    } else if (data?.holidays?.delete === 1) {
      const index = policy.holidays.findIndex(
        (item: any) => item.title === data.holidays?.title
      );
      if (index !== -1) {
        policy.holidays.splice(index, 1);
        const savedPolicy = await policy.save();
        return {
          status: "success",
          data: savedPolicy.holidays,
          message: "Holidays updated successfully",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          message: "The specified holiday does not exist",
          data: null,
          statusCode: statusCode.info,
        };
      }
    } else {
      policy.holidays.push(data.holidays);
      const savedPolicy = await policy.save();

      return {
        status: "success",
        data: savedPolicy,
        message: "Holidays updated successfully",
        statusCode: statusCode.success,
      };
    }
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

    const updatedWorkTiming = data.workTiming?.workTiming.map((newTiming: any) => {
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
    });

    policy.workTiming = updatedWorkTiming;

    const savedPolicy = await policy.save();

    return {
      status: "success",
      data: savedPolicy.workTiming,
      message: "WorkTiming updated successfully",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err)
  }
};
export const updateWorkLocations = async (data: any) => {
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

    if (data?.workLocation?.edit === 1) {
      const index = policy.workLocations.findIndex(
        (item: any) => item.locationName === data.workLocation?.oldLocation
      );

      if (index !== -1) {
        policy.workLocations[index] = data.workLocation;
        const savedPolicy = await policy.save();

        return {
          status: "success",
          data: savedPolicy.workLocations,
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
    } else if (data?.workLocation?.delete === 1) {
      const index = policy.workLocations.findIndex(
        (item: any) => item.locationName === data.workLocation?.locationName
      );
      if (index !== -1) {
        policy.workLocations.splice(index, 1);
        const savedPolicy = await policy.save();
        return {
          status: "success",
          data: savedPolicy.workLocations,
          message: "Holidays updated successfully",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          message: "The specified holiday does not exist",
          data: null,
          statusCode: statusCode.info,
        };
      }
    } else {
      policy.workLocations.push(data.workLocation);
      const savedPolicy = await policy.save();

      return {
        status: "success",
        data: savedPolicy.workLocations,
        message: "Location updated successfully",
        statusCode: statusCode.success,
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const uploadWorkLocationsByExcel = async(data : any) => {
  try
  {
    const policy: any = await CompanyPolicy.findOne({ company: data.company });

    if (!policy) {
      return {
        status: "success",
        message: "Policy not found",
        data: null,
        statusCode: statusCode.info,
      };
    }

    policy.workLocations = data?.workLocations

    const savedPolicy = await policy.save()
    return {
      status: "success",
      data: savedPolicy.workLocations,
      message: "Locations updated successfully",
      statusCode: statusCode.success,
    };
  }
  catch(err : any)
  {
    throw new Error(err);
  }
}