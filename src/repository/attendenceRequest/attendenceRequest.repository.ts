import AttendanceRequest from '../../schemas/AttendenceRequest/attendenceRequest.schema';

export async function findOneAttendenceRequest(query: any) {
  try {
    const attendance = await AttendanceRequest.findOne(query);
    return attendance;
  } catch (err : any) {
    throw new Error(`Failed to find attendance request: ${err.message}`);
  }
}

export async function createAttendenceRequest(data: any): Promise<any> {
  try {
    const attendanceData = new AttendanceRequest(data);
    const savedAttendance = await attendanceData.save();

    return {
      statusCode: 200,
      status: 'success',
      data: savedAttendance,
      message: 'Attendance request created successfully',
    };
  } catch (err : any) {
    return {
      statusCode: 500,
      status: 'error',
      data: err.message,
      message: 'Failed to create attendance request',
    };
  }
}


export async function findAttendanceRequests(data: any) {
  try {
    const officeStartTime = "23:30:00"; // Adjust according to your office start time
    const officeEndTime = "23:59:59";   // Adjust according to your office end time

    const pipeline: any = [
      {
        $match: {
          // Add your match conditions if needed
          // user: data.user,
          // date: {
          //   $gte: new Date(data.startDate),
          //   $lte: new Date(data.endDate),
          // },
        },
      },
      {
        $unwind: "$punchRecords",
      },
      {
        $match: {
          "punchRecords.isActive": true,
        },
      },
      {
        $sort: {
          "punchRecords.time": 1,
        },
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            user: "$user",
            companyDetail: "$companyDetail",
            date: "$date",
          },
          firstPunchIn: { $first: "$punchRecords.time" },
          lastPunchOut: { $last: "$punchRecords.time" },
          totalPunches: { $sum: 1 },
        },
      },
      {
        $addFields: {
          lateMinutes: {
            $cond: {
              if: {
                $gt: [
                  "$firstPunchIn",
                  {
                    $dateFromString: {
                      dateString: {
                        $concat: [
                          { $substr: ["$_id.date", 0, 10] }, // Extract the date part
                          `T${officeStartTime}.000Z`, // Add the office start time
                        ],
                      },
                    },
                  },
                ],
              },
              then: {
                $divide: [
                  {
                    $subtract: [
                      "$firstPunchIn",
                      {
                        $dateFromString: {
                          dateString: {
                            $concat: [
                              { $substr: ["$_id.date", 0, 10] },
                              `T${officeStartTime}.000Z`,
                            ],
                          },
                        },
                      },
                    ],
                  },
                  60000,
                ],
              },
              else: 0,
            },
          },
          earlyMinutes: {
            $cond: {
              if: {
                $lt: [
                  "$lastPunchOut",
                  {
                    $dateFromString: {
                      dateString: {
                        $concat: [
                          { $substr: ["$_id.date", 0, 10] },
                          `T${officeEndTime}.000Z`,
                        ],
                      },
                    },
                  },
                ],
              },
              then: {
                $divide: [
                  {
                    $subtract: [
                      {
                        $dateFromString: {
                          dateString: {
                            $concat: [
                              { $substr: ["$_id.date", 0, 10] },
                              `T${officeEndTime}.000Z`,
                            ],
                          },
                        },
                      },
                      "$lastPunchOut",
                    ],
                  },
                  60000,
                ],
              },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          _id: "$_id._id",
          user: "$_id.user",
          companyDetail: "$_id.companyDetail",
          date: "$_id.date",
          firstPunchIn: 1,
          lastPunchOut: 1,
          totalPunches: 1,
          lateMinutes: 1,
          earlyMinutes: 1,
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