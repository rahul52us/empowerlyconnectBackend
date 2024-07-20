import { statusCode } from "./statusCode";

export const createCatchError = (err: any) => {
  return {
    status: "error",
    data: err?.message,
    statusCode: statusCode.serverError,
    message: err?.message,
  };
};
