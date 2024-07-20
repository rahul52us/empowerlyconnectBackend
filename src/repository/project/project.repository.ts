import Task from "../../schemas/task/Task.schema";
import { statusCode } from "../../config/helper/statusCode";
import Project from "../../schemas/project/Project.schema";

const createProject = async (data: any) => {
  try {
    const projectData = new Project(data);
    const savedProject = await projectData.save();
    return {
      statusCode: 201,
      status: "success",
      data: savedProject,
      message: `${savedProject.project_name} project has been created successfully`,
    };
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      message: "Internal Server Error",
      statusCode: statusCode.serverError,
    };
  }
};

const updateProject = async (data: any) => {
  try {
    const projectData = await Project.findById(data.id);
    if (projectData) {
      const updatedProject: any = await Project.findByIdAndUpdate(
        data.id,
        { $set: data },
        { new: true }
      );
      return {
        statusCode: 200,
        message: `${updatedProject.project_name} project has been updated successfully`,
        data: updatedProject,
        status: "success",
      };
    } else {
      return {
        status: "error",
        data: `Project does not exists`,
        message: "Something went wrong",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: `${err?.message}`,
      message: "Internal Server Error",
      statusCode: statusCode.serverError,
    };
  }
};

const getSingleProject = async (data: any) => {
  try {
    const pipeline = [
      {
        $match: {
          _id: data.id,
          company: data.company,
          deletedAt: { $exists: false },
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$createdBy' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            { $project: { username: 1, _id: 1, code: 1 } },
          ],
          as: 'createdBy',
        },
      },
      {
        $unwind: {
          path: '$createdBy',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'companies',
          let: { companyId: '$company' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
            { $project: { companyName: 1, _id: 1 } },
          ],
          as: 'company',
        },
      },
      {
        $unwind: {
          path: '$company',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { projectManagerIds: '$project_manager' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$projectManagerIds'] } } },
            { $project: { username: 1, _id: 1, code: 1 } },
          ],
          as: 'project_manager',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { teamMemberIds: '$team_members' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$teamMemberIds'] } } },
            { $project: { username: 1, _id: 1, code: 1 } },
          ],
          as: 'team_members',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { followerIds: '$followers' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$followerIds'] } } },
            { $project: { username: 1, _id: 1, code: 1 } },
          ],
          as: 'followers',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { customerIds: '$customers' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$customerIds'] } } },
            { $project: { username: 1, _id: 1, code: 1 } },
          ],
          as: 'customers',
        },
      },
      {
        $project: {
          project_name: 1,
          subtitle: 1,
          description: 1,
          logo: 1,
          priority: 1,
          is_active: 1,
          createdBy: 1,
          company: 1,
          project_manager: 1,
          status: 1,
          startDate: 1,
          endDate: 1,
          dueDate: 1,
          customers: 1,
          team_members: 1,
          followers: 1,
          approval: 1,
          attach_files: 1,
          deletedAt: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const result = await Project.aggregate(pipeline).exec();

    if (result.length > 0) {
      return {
        status: "success",
        message: "Project Retrieved Successfully",
        data: result[0],
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        data: "Project does not exist",
        message: "Project does not exist",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      message: "Internal Server Error",
      statusCode: statusCode.info,
    };
  }
};



const getAllProjects = async (data: any) => {
  try {
    const { page = 1, limit = 10, company } = data;

    const pipeline: any = [];

    const matchConditions = {
      company: company,
      deletedAt: { $exists: false },
    };

    pipeline.push({
      $match: matchConditions,
    });

    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });

    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const totalProjectsPipeline = [
      { $match: matchConditions },
      { $count: "total" },
    ];

    const [result, totalProjects] = await Promise.all([
      Project.aggregate(pipeline),
      Project.aggregate(totalProjectsPipeline),
    ]);

    const total = totalProjects.length > 0 ? totalProjects[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      data: { data: result, totalPages: totalPages },
      page,
      message: "Projects retrieved successfully",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      message: "Internal Server Error",
      statusCode: statusCode.serverError,
    };
  }
};

// CREATE TASK FUNCTION
const findSingleTask = async (datas: any) => {
  try {
    const taskData = await Task.findOne({
      _id: datas.id,
      deletedAt: { $exists: false },
    });
    if (taskData) {
      return {
        status: "success",
        data: taskData,
        message: "Retrived task successfully",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        data: "Task does not exists",
        message: "Task does not exists",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      message: err?.message,
      statusCode: statusCode.info,
    };
  }
};

const createTask = async (datas: any) => {
  try {
    const projects = await Project.findOne({
      _id: datas.projectId,
      company: datas.company,
      deletedAt: { $exists: true },
    });
    if (projects) {
      const newTask = new Task(datas);
      const savedTask = await newTask.save();
      return {
        status: "success",
        data: savedTask,
        message: `${savedTask.title} task has been created successfully`,
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        data: "Project does not exists",
        message: `Project does not exists`,
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      message: "Internal Server Error",
      statusCode: statusCode.serverError,
    };
  }
};

const updateTask = async (datas: any) => {
  try {
    const projects = await Project.findOne({
      _id: datas.projectId,
      company: datas.company,
      deletedAt : {$exists : true}
    });
    if (projects) {
      const { status: taskStatus } = await findSingleTask({ id: datas.taskId });
      if (taskStatus === "success") {
        const updatedTask = await Task.findByIdAndUpdate(
          datas.taskId,
          { $set: datas },
          { new: true }
        );
        return {
          data: updatedTask,
          status: "success",
          statusCode: statusCode.success,
          message: "Task has been updated successfully",
        };
      } else {
        return {
          status: "error",
          data: "Task does not exists",
          message: `task does not exists`,
          statusCode: statusCode.info,
        };
      }
    } else {
      return {
        status: "error",
        data: "Project does not exists",
        message: `Project does not exists`,
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      message: "Internal Server Error",
      statusCode: statusCode.serverError,
    };
  }
};

export {
  createProject,
  updateProject,
  getAllProjects,
  getSingleProject,
  createTask,
  updateTask,
};
