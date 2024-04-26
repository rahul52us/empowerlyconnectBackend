import CompanyPolicy from "../../schemas/company/CompanyPolicy";
import Company from "../../schemas/company/Company";
import { statusCode } from "../../config/helper/statusCode";
import mongoose from "mongoose";

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

export const updateHolidays = async(data : any) => {
  try {
    const policy : any = await CompanyPolicy.findOne({company : data.company})
    if(policy){
        policy.holidays = [...policy.holidays,data.holidays]
        const savedPolicy = await policy.save()
        return {
            status : 'success',
            data : savedPolicy,
            message : 'holidays has been updated successfully',
            statusCode:statusCode.success
        }
    }
    else {
        return {
            status : 'success',
            message : 'Policy does not exists',
            data : 'Policy does not exists',
            statusCode : statusCode.info
        }
    }
  } catch (err: any) {
    throw new Error(err)
  }
};


export const getHolidays = async(data : any) => {
  try {
    const policy : any = await CompanyPolicy.findOne({company : new mongoose.Types.ObjectId(data.company)})
    if(policy){
        return {
            status : 'success',
            data : policy.holidays || [],
            message : 'Successfully get holidays',
            statusCode:statusCode.success
        }
    }
    else {
        return {
            status : 'success',
            message : 'Policy does not exists',
            data : 'Policy does not exists',
            statusCode : statusCode.info
        }
    }
  } catch (err: any) {
    throw new Error(err)
  }
};
