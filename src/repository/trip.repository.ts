import { createCatchError } from "../config/helper/function";
import { statusCode } from "../config/helper/statusCode";
import { TripModel as Trip } from "../schemas/trip/trip.schema";
import { findUserById } from "./auth/auth.repository";
import { deleteFile, uploadFile } from "./uploadDoc.repository";

export const createTrip = async (data: any) => {
  try {
    const trip = new Trip(data);
    const savedTrip = await trip.save();

    if (
      data.thumbnail &&
      data?.thumbnail?.buffer &&
      data.thumbnail?.trim !== ""
    ) {
      let url = await uploadFile(data.thumbnail);
      data.thumbnail = {
        name: data.thumbnail.filename,
        url: url,
        type: data.thumbnail.type,
      };
      savedTrip.thumbnail = data.thumbnail;
      await savedTrip.save();
    }

    return {
      status: "success",
      data: savedTrip,
      statusCode: statusCode.success,
      message: `${data.title} trip has been created successfully`,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const updateTrip = async (data: any) => {
  try {
    const trip = await Trip.findById(data._id);
    if (trip) {
      const updatedData: any = await Trip.findByIdAndUpdate(data._id, data, {
        new: true,
      });

      if (
        data.isFileDeleted === 1 &&
        updatedData.thumbnail?.url &&
        updatedData.thumbnail?.name
      ) {
        await deleteFile(updatedData.thumbnail.name);
        updatedData.thumbnail = {
          name: undefined,
          url: undefined,
          type: undefined,
        };
        await updatedData.save();
      }

      if (
        data.thumbnail?.filename &&
        data.thumbnail?.buffer &&
        data.thumbnail
      ) {
        const { filename, type } = data.thumbnail;
        const url = await uploadFile(data.thumbnail);
        updatedData.thumbnail = {
          name: filename,
          url,
          type,
        };
        await updatedData.save();
      }

      return {
        status: "success",
        data: updatedData,
        statusCode: statusCode.success,
        message: "Trip Update Successfully",
      };
    } else {
      return {
        status: "error",
        data: "Trip does not exists",
        statusCode: statusCode.info,
        message: "Trip does not exists",
      };
    }
  } catch (err) {
    return createCatchError(err);
  }
};

export const getSingleTrips = async (data: any) => {
  try {
    const pipeline: any = [];

    pipeline.push(
      {
        $match: {
          _id: data._id,
          deletedAt: { $exists: false },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$createdBy" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { username: 1, _id: 1, code: 1 } },
          ],
          as: "createdBy",
        },
      },
      {
        $unwind: {
          path: "$participants",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { teamMemberId: "$participants.user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$teamMemberId"] } } },
            { $project: { username: 1, _id: 1, code: 1, pic : 1, name : 1 } },
          ],
          as: "participants.user",
        },
      },
      {
        $unwind: {
          path: "$participants.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          participants: {
            $push: {
              user: "$participants.user",
              isActive: "$participants.isActive",
            },
          },
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { participants: "$participants" }],
          },
        },
      },
      {
        $limit: 1,
      }
    );
    const trip = await Trip.aggregate(pipeline);
    if (trip.length) {
      return {
        data: trip[0],
        message: "Retrieved Trip Data",
        statusCode: statusCode.success,
        status: "success",
      };
    } else {
      return {
        data: "Trip does not exists",
        message: "Failed to Retrieved Trip Data",
        statusCode: statusCode.info,
        status: "error",
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getTrips = async (data: any) => {
  try {
    const pipeline: any = [];

    let matchConditions: any = {
      company: {$in : data.company},
      companyOrg: data.companyOrg,
      deletedAt: { $exists: false },
    };

    if (data.search) {
      matchConditions = { ...matchConditions, code: data.search?.trim() };
    }

    pipeline.push({
      $match: matchConditions,
    });
    let documentPipeline: any = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (data.page - 1) * data.limit },
      { $limit: data.limit },
    ];

    const [resultData, countDocuments]: any = await Promise.all([
      Trip.aggregate(documentPipeline),
      Trip.aggregate([
        ...pipeline,
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalCounts = countDocuments.length > 0 ? countDocuments[0].count : 0;

    return {
      status: "success",
      data: resultData,
      totalPages: Math.ceil(totalCounts / data.limit),
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

export const getAllDayTripCount = async (data: any) => {
  try {
    const pipeline = [
      {
        $match: {
          company: {$in : data.company},
          companyOrg: data.companyOrg,
          createdAt: { $gte: data.startDate, $lte: data.endDate },
          deletedAt: { $exists: false },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          title: "$_id",
          count: 1,
        },
      },
    ];

    const result = await Trip.aggregate(pipeline);

    return {
      status: "success",
      data: result,
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

export const getTripCounts = async (data: any) => {
  try {
    const pipeline = [
      {
        $match: {
          ...data,
          company : {$in : data.company},
          deletedAt: { $exists: false },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];

    const result = await Trip.aggregate(pipeline);

    return {
      status: "success",
      data: result.length > 0 ? result[0].count : 0,
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

export const totalTripTypeCount = async (data: any) => {
  try {
    const pipeline: any = [];

    pipeline.push({
      $match: {
        company: { $in: data.company },
        deletedAt: { $exists: false }
      }
    });

    pipeline.push({
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    });

    pipeline.push({
      $project : {
        _id : 0,
        count : 1,
        title : '$_id'
      }
    })

    const result = await Trip.aggregate(pipeline);

    return {
      status: "success",
      data: result,
      statusCode: statusCode.success,
      message: 'Get Trip type counts'
    };

  } catch (err: any) {
    return createCatchError(err);
  }
}

export const totalTripUserTypeCount = async (data: any) => {
  try {
    const pipeline: any = [];

    pipeline.push({
      $match: {
        company: { $in: data.company },
        deletedAt: { $exists: false },
        participants: { $in: data.users},
      },
    });

    pipeline.push({
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    });

    pipeline.push({
      $project: {
        _id: 0,
        count: 1,
        title: "$_id",
      },
    });

    const result = await Trip.aggregate(pipeline);

    return {
      status: "success",
      data: result,
      statusCode: 200,
      message: "Get Trip type counts",
    };
  } catch (err: any) {
    return {
      status: "error",
      message: err.message,
      statusCode: 500,
    };
  }
};

export const addTripMembers = async (data: any) => {
  try {
    const { id, type, user, isActive } = data;

    const tripData = await Trip.findById(id);
    if (!tripData) {
      return {
        status: "error",
        data: "Trip does not exist",
        message: "Trip not found",
        statusCode: statusCode.info,
      };
    }

    const memberTypeMap: Record<string, any> = {
      participants: tripData.participants,
    };

    const memberList = memberTypeMap[type];
    if (!memberList) {
      return {
        status: "error",
        data: "Invalid type provided",
        message: "No such type exists",
        statusCode: statusCode.info,
      };
    }


      const isMemberExists = memberList.some((item: any) => item.user.equals(user));
      if (isMemberExists) {
        return {
          status: "error",
          data: `User is already a ${type}`,
          message: `${type} already exists`,
          statusCode: statusCode.info,
        };
      }

    memberList.push({ user, isActive });

    await tripData.save();

    const userData = await findUserById(user);

    return {
      status: "success",
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`,
      data: { user: userData, isActive },
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const calculateTripAmountByTitle = async (data : any) => {
  try {
    const result = await Trip.aggregate([
      {
        $match: {
          company : {$in : data.company},
          deletedAt: { $exists: false },
        }
      },
      {
        $addFields: {
          totalTravelCost: {
            $sum: {
              $map: {
                input: "$travelDetails",
                as: "detail",
                in: {
                  $add: [
                    { $toDouble: "$$detail.travelCost" },
                    { $cond: [{ $ifNull: ["$$detail.isCab", false] }, { $toDouble: "$$detail.cabCost" }, 0] },
                    { $cond: [{ $ifNull: ["$$detail.isAccommodation", false] }, { $toDouble: "$$detail.accommodationCost" }, 0] }
                  ]
                }
              }
            }
          },
          totalAdditionalExpenses: {
            $sum: {
              $map: {
                input: "$additionalExpenses",
                as: "expense",
                in: { $toDouble: "$$expense.amount" }
              }
            }
          }
        }
      },
      {
        $addFields: {
          totalAmount: {
            $add: ["$totalTravelCost", "$totalAdditionalExpenses"]
          }
        }
      },
      {
        $group: {
          _id: "$title",
          count: { $sum: "$totalAmount" }
        }
      },
      {
        $project: {
          _id: 0,
          title: "$_id",
          count: 1
        }
      }
    ]);

    return {
      status: "success",
      message: `GET Trip Amounts By Title Successfully`,
      data: result,
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const calculateTotalTripsAmount = async (data : any) => {
  try
  {
  const result = await Trip.aggregate([
    {
      $match: { company : {$in : data.company} }
    },
    {
      $addFields: {
        totalTravelCost: {
          $sum: {
            $map: {
              input: "$travelDetails",
              as: "detail",
              in: {
                $add: [
                  { $toDouble: "$$detail.travelCost" }, // Convert string to double
                  { $cond: [{ $ifNull: ["$$detail.isCab", false] }, { $toDouble: "$$detail.cabCost" }, 0] },
                  { $cond: [{ $ifNull: ["$$detail.isAccommodation", false] }, { $toDouble: "$$detail.accommodationCost" }, 0] }
                ]
              }
            }
          }
        },
        totalAdditionalExpenses: {
          $sum: {
            $map: {
              input: "$additionalExpenses",
              as: "expense",
              in: { $toDouble: "$$expense.amount" }
            }
          }
        }
      }
    },
    {
      $addFields: {
        totalAmount: {
          $add: ["$totalTravelCost", "$totalAdditionalExpenses"]
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalAmount: 1
      }
    }
  ]);
  return {
    status: "success",
    message: `GET Trip Amounts Successfully`,
    data: result.length > 0 ? result[0].totalAmount : 0,
    statusCode: statusCode.success,
  };
}
catch(err : any)
{
  return createCatchError(err);
}
};

