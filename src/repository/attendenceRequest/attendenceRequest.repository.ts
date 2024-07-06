import AttendanceRequest from "../../schemas/AttendenceRequest/attendenceRequest.schema";

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

    const startUTC = new Date(startDate);
    const endUTC = new Date(endDate);

    const pipeline: any[] = [
      {
        $match: {
          // user : user,
          date: {
            $gte: startUTC,
            $lte: endUTC,
          },
        },
      },
      {
        $addFields: {
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
              amount: -330, // Convert IST to UTC (5 hours 30 minutes difference)
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
              amount: -330, // Convert IST to UTC (5 hours 30 minutes difference)
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
        },
      },
      {
        $addFields: {
          lateComingMinutes: {
            $cond: [
              {
                $gt: [
                  { $subtract: ["$punchInTime", "$officeStartTimeUTC"] },
                  { $multiply: ["$gracePeriodMinutesLate", 60000] }, // Convert minutes to milliseconds
                ],
              },
              {
                $divide: [
                  {
                    $subtract: [
                      "$punchInTime",
                      { $add: ["$officeStartTimeUTC", { $multiply: ["$gracePeriodMinutesLate", 60000] }] },
                    ],
                  },
                  60000, // Convert milliseconds to minutes
                ],
              },
              0, // Default value if condition is false
            ],
          },
          earlyGoingMinutes: {
            $cond: [
              {
                $gt: [
                  { $subtract: ["$officeEndTimeUTC", { $multiply: ["$gracePeriodMinutesEarly", 60000] }] },
                  "$punchOutTime",
                ],
              },
              {
                $divide: [
                  {
                    $subtract: [
                      { $add: ["$officeEndTimeUTC", { $multiply: ["$gracePeriodMinutesEarly", 60000] }] },
                      "$punchOutTime",
                    ],
                  },
                  60000, // Convert milliseconds to minutes
                ],
              },
              0, // Default value if condition is false
            ],
          },
        },
      },
      {
        $project: {
          punchInTime: 1,
          punchOutTime: 1,
          lateComingMinutes: 1,
          earlyGoingMinutes: 1,
          punchRecords: 1,
          date: 1,
        },
      },
    ];

    const attendanceRequests = await AttendanceRequest.aggregate(pipeline);
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







