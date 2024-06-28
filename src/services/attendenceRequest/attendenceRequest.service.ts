import { Response, NextFunction } from "express";
import {
  createAttendenceRequest,
  findOneAttendenceRequest,
  findAttendanceRequests,
} from "../../repository/attendenceRequest/attendenceRequest.repository";

const OFFICE_START_HOUR = 9;
const OFFICE_END_HOUR = 18;

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
  return Math.floor(diffInMilliseconds / (1000 * 60)); // Convert milliseconds to minutes
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
              isActive,
            },
          ],
          date: new Date(),
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
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    const attendenceRequests = await findAttendanceRequests({
      user: userId,
      startDate: new Date(),
      endDate: new Date()
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

export const calculateLateAndEarly = (
  attendance: any
): { late: number; early: number } => {
  const punchRecords = attendance.punchRecords;
  if (punchRecords.length < 2) {
    return { late: 0, early: 0 };
  }

  const firstPunch = punchRecords[0].time;
  const lastPunch = punchRecords[punchRecords.length - 1].time;

  const officeStartTime = new Date(firstPunch);
  officeStartTime.setHours(OFFICE_START_HOUR, 0, 0, 0);

  const officeEndTime = new Date(firstPunch);
  officeEndTime.setHours(OFFICE_END_HOUR, 0, 0, 0);

  const lateMinutes = Math.max(
    0,
    calculateTimeDifference(officeStartTime, firstPunch)
  );
  const earlyMinutes = Math.max(
    0,
    calculateTimeDifference(lastPunch, officeEndTime)
  );

  return { late: lateMinutes, early: earlyMinutes };
};
