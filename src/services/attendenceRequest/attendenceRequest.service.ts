import { Response, NextFunction } from "express";
import {
  createAttendenceRequest,
  findOneAttendenceRequest,
  findAttendanceRequests,
} from "../../repository/attendenceRequest/attendenceRequest.repository";
import mongoose from "mongoose";

const predefinedLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  radius: 1.0,
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const calculateTimeDifference = (startTime: Date, endTime: Date): number => {
  const diffInMilliseconds = endTime.getTime() - startTime.getTime();
  return Math.floor(diffInMilliseconds / (1000 * 60));
};

export const createAttendenceRequestService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { latitude, longitude, deviceInfo } = req.body;
    const userId = req.userId;
    const companyDetail = req.bodyData.companyDetail;

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEnd = new Date().setHours(23, 59, 59, 999);

    let attendance = await findOneAttendenceRequest({
      user: userId,
      companyDetail: companyDetail,
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    const isActive =
      calculateDistance(
        predefinedLocation.latitude,
        predefinedLocation.longitude,
        parseFloat(latitude),
        parseFloat(longitude)
      ) <= predefinedLocation.radius;

    if (!attendance) {
      const { statusCode, status, data, message } =
        await createAttendenceRequest({
          user: userId,
          companyDetail: companyDetail,
          punchRecords: [
            {
              time: new Date(),
              latitude,
              longitude,
              deviceInfo,
              isActive: true,
            },
          ],
          date: new Date(),
          officeStartTime: "08:00",
          officeEndTime: "12:00",
        });

      res.status(statusCode).send({
        status,
        data,
        message,
      });
    } else {
      attendance.punchRecords.push({
        time: new Date(),
        latitude,
        longitude,
        deviceInfo,
        isActive,
      });

      const savedAttendance = await attendance.save();

      res.status(200).send({
        status: "success",
        data: savedAttendance,
        message: "Punch recorded successfully",
      });
    }
  } catch (err: any) {
    res.status(500).send({
      status: "error",
      data: err?.message,
      message: err?.message,
    });
  }
};

export const getAttendenceRequestsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, companyId } = req.query;
    const userId = req.userId;

    const attendenceRequests = await findAttendanceRequests({
      user: new mongoose.Types.ObjectId(userId),
      startDate: startDate,
      endDate: endDate,
      companyId : companyId
    });

    res.status(200).send({
      status: "success",
      data: attendenceRequests,
      message: "Attendance requests retrieved successfully",
    });
  } catch (err: any) {
    res.status(500).send({
      status: "error",
      data: err?.message,
      message: err?.message,
    });
  }
};