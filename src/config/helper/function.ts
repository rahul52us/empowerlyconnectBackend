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
    if(!Array.isArray(data)){
      data = [data]
    }
    data = data.map((item : string) => new mongoose.Types.ObjectId(item))
    return data || []
  }
  catch{
    return []
  }
}

export function generateFileName(originalName: string): string {
  const randomChars = Math.random().toString(36).substring(2, 7); // Generate 5 random alphanumeric characters
  const extension = originalName.split('.').pop(); // Get the file extension
  const baseName = originalName.replace(/\.[^/.]+$/, ""); // Get the file name without the extension

  return `${randomChars}_${baseName}.${extension}`; // Combine random characters, base name, and extension
}
