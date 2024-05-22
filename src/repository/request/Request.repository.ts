import Request from "../../schemas/Request/Request.schema";

export const createRequest = async (data: any) => {
  try {
    const request = new Request(data);
    const savedRequest = await request.save();
    return {
      status: "success",
      data: savedRequest,
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

export const getRequestById = async (data: any) => {
  try {
    const pipeline: any = [];
    let matchConditions: any = {
      deletedAt: { $exists: false },
      _id : data._id
    };

    pipeline.push(
      {
        $match: matchConditions
      },
      {
        $lookup: {
          from: "users",
          localField: "sendTo",
          foreignField: "_id",
          as: "sendTo",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1
              }
            }
          ]
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1
              }
            }
          ]
        },
      },
      {
        $limit : 1
      }
    );
    let documentPipeline: any = [
      ...pipeline,
    ];

    const [resultData]: any = await Promise.all([
      Request.aggregate(documentPipeline),
    ]);

    if(resultData.length === 0){
      return {
        status: "error",
      statusCode : 300,
      data: resultData,
      message : 'Request Does not Exists'
      }
    }
    return {
      status: "success",
      statusCode : 200,
      data: resultData,
      message : 'Get Request Successfully'
    };

  } catch (err) {
    return {
      status: "error",
      data: err,
      statusCode : 500
    };
  }
};

export const getRequests = async (data: any) => {
  try {
    const pipeline: any = [];

    let matchConditions: any = {
      deletedAt: { $exists: false },
    };

    pipeline.push(
      {
        $match: matchConditions
      },
      {
        $lookup: {
          from: "users",
          localField: "sendTo",
          foreignField: "_id",
          as: "sendTo",
        },
      },
    );
    let documentPipeline: any = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (data.page - 1) * data.limit },
      { $limit: Number(data.limit) },
    ];

    const [resultData, countDocuments]: any = await Promise.all([
      Request.aggregate(documentPipeline),
      Request.aggregate([
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