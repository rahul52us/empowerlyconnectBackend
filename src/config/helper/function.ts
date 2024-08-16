import mongoose from "mongoose";
import { statusCode } from "./statusCode";

export const createCatchError = (err: any) => {
  return {
    status: "error",
    data: err?.message,
    statusCode: statusCode.serverError,
    message: err?.message,
  };
};

export const convertIdsToObjects = async (data : any) => {
  try
  {
    data = data.map((item : string) => new mongoose.Types.ObjectId(item))
    return data || []
  }
  catch{
    return []
  }
}
