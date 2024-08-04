import { createCatchError } from "../config/helper/function";
import { statusCode } from "../config/helper/statusCode";
import { TripModel as Trip } from "../schemas/trip/trip.schema";
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
          from: 'users',
          let: { participantIds: '$participants' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$participantIds'] } } },
            { $project: { username: 1, _id: 1, role: 1 } },
          ],
          as: 'participants',
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
