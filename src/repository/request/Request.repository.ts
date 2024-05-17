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

export const getRequests = async (data: any) => {
  try {
    const pipeline: any = [];

    let matchConditions: any = {
      deletedAt: { $exists: false },
    };

    pipeline.push(
      {
        $match: matchConditions,
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