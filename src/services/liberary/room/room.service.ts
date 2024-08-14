import { NextFunction, Response } from "express";
import mongoose from "mongoose";
import { PaginationLimit } from "../../../config/helper/constant";
import { convertIdsToObjects } from "../../../config/helper/function";
import {
  createRoom,
  getAllRoomCounts,
  getAllRooms,
  getAllRoomTitleCounts,
  getSingleRoomById,
  updateRoom,
} from "../../../repository/liberary/room/room.repository";

export const createRoomService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.user = req.userId;
    req.body.company = new mongoose.Types.ObjectId(req.body.company);
    const { status, statusCode, data, message } = await createRoom(req.body);
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateRoomService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    req.body.company = new mongoose.Types.ObjectId(req.body.company);
    const { status, statusCode, data, message } = await updateRoom(req.body);
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getSingleRoomByIdService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, statusCode, data, message } = await getSingleRoomById(
      req.body
    );
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getAllRoomService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.page = req.query.page ? Number(req.query.page) : 1;
    req.body.limit = req.query.limit
      ? Number(req.query.limit)
      : PaginationLimit;
    req.body.company = await convertIdsToObjects(req.body.company);
    const { status, statusCode, data, message } = await getAllRooms(req.body);
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getRoomCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = await convertIdsToObjects(req.body.company);
    const { status, statusCode, data, message } = await getAllRoomCounts(
      req.body
    );
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getRoomTitleCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = await convertIdsToObjects(req.body.company);
    const { status, statusCode, data, message } = await getAllRoomTitleCounts(
      req.body
    );
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};
