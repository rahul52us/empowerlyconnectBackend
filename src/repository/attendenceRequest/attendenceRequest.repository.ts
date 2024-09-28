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
    const { startDate, endDate, user } = data;

    const pipeline: any[] = [
      // Match records based on user and date range
      {
        $match: {
          user: new mongoose.Types.ObjectId(user),
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      // Lookup leave requests within the date range
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
      // Lookup holiday information from company policies
      {
        $lookup: {
          from: "companypolicies",
          let: {
            policyId: "$policy",
            date: "$date",
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$policyId"] } } },
            { $unwind: "$holidays" },
            {
              $addFields: {
                holidaysDateConverted: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$holidays.date",
                  },
                },
                lookupDate: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$$date",
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
            {
              $project: {
                holiday: "$holidays",
              },
            },
          ],
          as: "holidayInfo",
        },
      },
      // Lookup the policy information (grace periods, timings)
      {
        $lookup: {
          from: "companypolicies",
          localField: "policy",
          foreignField: "_id",
          as: "policyInfo",
        },
      },
      // Add fields for policy details (grace periods, etc.) and holiday status
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
              amount: -330, // Convert from IST to UTC
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
              amount: -330, // Convert from IST to UTC
            },
          },
          activePunches: {
            $filter: {
              input: "$punchRecords",
              as: "punch",
              cond: { $eq: ["$$punch.isActive", true] },
            },
          },
          gracePeriodMinutesLate: { $arrayElemAt: ["$policyInfo.gracePeriodMinutesLate", 0] },
          gracePeriodMinutesEarly: { $arrayElemAt: ["$policyInfo.gracePeriodMinutesEarly", 0] },
          isSaturday: { $eq: [{ $dayOfWeek: "$date" }, 7] }, // Check if it's Saturday
          saturdayIndex: {
            $cond: [
              { $eq: [{ $dayOfWeek: "$date" }, 7] }, // Check if it's Saturday
              {
                $add: [
                  {
                    $subtract: [
                      { $dayOfMonth: "$date" },
                      { $literal: 1 } // This accounts for the zero-based index
                    ]
                  },
                  { $floor: { $divide: [{ $dayOfMonth: "$date" }, 7] } } // Calculate how many weeks have passed
                ]
              },
              null // Not a Saturday
            ]
          },

          saturdays: { $literal: [1, 0, 1, 1, 1] }, // Define the array using $literal
          saturdaySchedule: {
            $cond: [
              { $lt: ["$saturdayIndex", 5] },
              { $arrayElemAt: ["$saturdays", "$saturdayIndex"] }, // Access the saturdays array
              0 // Default to non-working if out of bounds
            ]
          }
        }
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
          saturdayIndex :1,
          isSaturday: 1,
          isSaturdayWorkingDay: { $eq: ["$saturdaySchedule", 1] }, // Check if Saturday is a working day
          saturdaySchedule: 1,
        },
      },

      // Add fields for late coming and early going calculations
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
                        $subtract: [
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
                          if: "$isSaturday",
                          then: {
                            $cond: {
                              if: { $eq: ["$isSaturdayWorkingDay", true] },
                              then: "Working on Saturday",
                              else: "Off on Saturday",
                            },
                          },
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
        },
      },
    ];

    const attendanceRequests = await AttendanceRequest.aggregate(pipeline);
    return attendanceRequests;
  } catch (error: any) {
    console.error(`Failed to perform attendance requests aggregation: ${error.message}`);
    throw new Error(`Failed to perform attendance requests aggregation: ${error.message}`);
  }
}






