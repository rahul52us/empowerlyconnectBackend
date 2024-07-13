import AttendanceRequest from "../../schemas/AttendenceRequest/attendenceRequest.schema";
import mongoose from "mongoose";
// Find one request by the query
export async function findOneAttendenceRequest(query: any) {
  try {
    const attendance = await AttendanceRequest.findOne(query);
    return attendance;
  } catch (err: any) {
    throw new Error(`Failed to find attendance request: ${err.message}`);
  }
}

// create and update existing request
export async function createAttendenceRequest(data: any): Promise<any> {
  try {
    const attendanceData = new AttendanceRequest(data);
    const savedAttendance = await attendanceData.save();

    return {
      statusCode: 200,
      status: "success",
      data: savedAttendance,
      message: "Attendance request created successfully",
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      status: "error",
      data: err.message,
      message: "Failed to create attendance request",
    };
  }
}

export async function findAttendanceRequests(data: any) {
  try {
    const { startDate, endDate, user, companyId } = data;

    const pipeline: any[] = [
      {
        $match: {
          user: new mongoose.Types.ObjectId(user),
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $lookup: {
          from: "requests",
          let: {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            user: new mongoose.Types.ObjectId(user),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$user"] },
                    { $lte: ["$startDate", "$$endDate"] },
                    { $gte: ["$endDate", "$$startDate"] },
                    { $eq: ["$status", "approved"] },
                  ],
                },
              },
            },
          ],
          as: "leaveRequests",
        },
      },
      {
        $lookup: {
          from: "companypolicies",
          let: {
            date: "$date",
            companyId: new mongoose.Types.ObjectId(companyId),
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$company", "$$companyId"] } } },
            { $unwind: "$holidays" },
            {
              $addFields: {
                holidaysDateConverted: {
                  $dateFromString: {
                    dateString: {
                      $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$holidays.date",
                      },
                    },
                  },
                },
                lookupDate: {
                  $dateFromString: {
                    dateString: {
                      $dateToString: { format: "%Y-%m-%d", date: "$$date" },
                    },
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ["$holidaysDateConverted", "$lookupDate"],
                },
              },
            },
            { $project: { holiday: "$holidays" } }
          ],
          as: "holidayInfo",
        },
      },
      {
        $addFields: {
          isHoliday: { $gt: [{ $size: "$holidayInfo" }, 0] },
          officeStartTimeUTC: {
            $dateAdd: {
              startDate: {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                      "T",
                      "$officeStartTime",
                      ":00",
                    ],
                  },
                },
              },
              unit: "minute",
              amount: -330,
            },
          },
          officeEndTimeUTC: {
            $dateAdd: {
              startDate: {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                      "T",
                      "$officeEndTime",
                      ":00",
                    ],
                  },
                },
              },
              unit: "minute",
              amount: -330,
            },
          },
          activePunches: {
            $filter: {
              input: "$punchRecords",
              as: "punch",
              cond: { $eq: ["$$punch.isActive", true] },
            },
          },
        },
      },
      {
        $project: {
          punchInTime: { $arrayElemAt: ["$activePunches.time", 0] },
          punchOutTime: { $arrayElemAt: ["$activePunches.time", -1] },
          officeStartTimeUTC: 1,
          officeEndTimeUTC: 1,
          punchRecords: 1,
          date: 1,
          gracePeriodMinutesLate: 1,
          gracePeriodMinutesEarly: 1,
          isHoliday: 1,
          holidayInfo: 1,
          leaveRequests: 1,
        },
      },
      {
        $addFields: {
          lateComingMinutes: {
            $cond: [
              {
                $gt: [
                  { $subtract: ["$punchInTime", "$officeStartTimeUTC"] },
                  { $multiply: ["$gracePeriodMinutesLate", 60000] },
                ],
              },
              {
                $divide: [
                  {
                    $subtract: [
                      "$punchInTime",
                      {
                        $add: [
                          "$officeStartTimeUTC",
                          { $multiply: ["$gracePeriodMinutesLate", 60000] },
                        ],
                      },
                    ],
                  },
                  60000,
                ],
              },
              0,
            ],
          },
          earlyGoingMinutes: {
            $cond: [
              {
                $gt: [
                  {
                    $subtract: [
                      "$officeEndTimeUTC",
                      { $multiply: ["$gracePeriodMinutesEarly", 60000] },
                    ],
                  },
                  "$punchOutTime",
                ],
              },
              {
                $divide: [
                  {
                    $subtract: [
                      {
                        $add: [
                          "$officeEndTimeUTC",
                          { $multiply: ["$gracePeriodMinutesEarly", 60000] },
                        ],
                      },
                      "$punchOutTime",
                    ],
                  },
                  60000,
                ],
              },
              0,
            ],
          },
          status: {
            $cond: {
              if: "$isHoliday",
              then: "Holiday",
              else: {
                $cond: {
                  if: { $gt: [{ $size: "$leaveRequests" }, 0] },
                  then: { $arrayElemAt: ["$leaveRequests.leaveType", 0] },
                  else: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ["$punchInTime", null] },
                          { $eq: ["$punchOutTime", null] },
                        ],
                      },
                      then: "Absent",
                      else: {
                        $cond: {
                          if: {
                            $and: [
                              { $lte: ["$lateComingMinutes", 0] },
                              { $lte: ["$earlyGoingMinutes", 0] },
                            ],
                          },
                          then: "Present",
                          else: {
                            $cond: {
                              if: { $gt: ["$lateComingMinutes", 0] },
                              then: "Late",
                              else: {
                                $cond: {
                                  if: { $gt: ["$earlyGoingMinutes", 0] },
                                  then: "Early",
                                  else: "On Time",
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ];

    const attendanceRequests = await AttendanceRequest.aggregate(
      pipeline
    ).exec();
    return attendanceRequests;
  } catch (error: any) {
    console.error(
      `Failed to perform attendance requests aggregation: ${error.message}`
    );
    throw new Error(
      `Failed to perform attendance requests aggregation: ${error.message}`
    );
  }
}
