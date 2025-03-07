import { Response } from "express";
import { createContact, getContacts } from "../../repository/contact/contact.repository";
import SendMail from "../../config/sendMail/sendMail";
import mongoose from "mongoose";

export const createContactService = async (
  req: any,
  res: Response,
  next: any
) => {
  try {
    const { status, statusCode, data, message } = await createContact({...req.body, name : `${req.body.firstName} ${req.body.lastName}`});

    if (status === "success") {
      const websiteEmail = process.env.WEBSITE_EMAIL;

      if (!websiteEmail) {
        return res.status(500).send({
          message: "Website email is not configured.",
          status: "error",
        });
      }

      SendMail(
        websiteEmail,
        "User Information Submission Alert",
        "contact/userInfo.html",
        { ...req.body, reciever_mail: websiteEmail }
      );

      SendMail(
        req.body.email,
        "Your Information Has Been Successfully Submitted",
        "contact/customerMail.html",
        { ...req.body }
      );

      return res.status(statusCode).send({
        message: message,
        data: req.body,
        status: status,
      });
    } else {
      // If creation fails, return the error response
      return res.status(statusCode).send({
        data,
        message,
        status,
      });
    }
  } catch (err: any) {
    next(err);
  }
};

export const getContactsService = async (
  req: any,
  res: Response,
  next: any
) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req?.query?.search?.trim() || undefined;

    const { status, statusCode, data , totalPages, message } = await getContacts(search, page, limit, new mongoose.Types.ObjectId(req.body.company));

    return res.status(statusCode).send({
      message: message,
      status: status,
      data: {data, totalPages},
      totalPages
    });
  } catch (err: any) {
    next(err);
  }
};
