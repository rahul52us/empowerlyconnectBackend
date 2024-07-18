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

const getSingleProject = async(data : any) => {
  try
  {
    const result = await Project.findOne({_id:data.id,company:data.company, deletedAt : {$exists : false}})
    if(result){
      return {
        status : 'success',
        message : 'Project Retrieved Successfully',
        data : result,
        statusCode : statusCode.success
      }
    }
    else {
      return {
        status : 'error',
        data : 'Project does not exists',
        message : 'Project does not exists',
        statusCode : statusCode.info
      }
    }
  }
  catch(err : any)
  {
    return {
      status : 'error',
      data : err?.message,
      message : 'Internal Server Error',
      statusCode : statusCode.info
    }
  }
}

const getAllProjects = async(data  : any) => {
  try {
    const { page = 1, limit = 10, company } = data;

    const pipeline : any = [];

    const matchConditions = {
      company: company,
      deletedAt : {$exists : false}
    };

    pipeline.push({
      $match: matchConditions
    });

    pipeline.push({
      $sort : {
        createdAt : -1
      }
    })

    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const totalProjectsPipeline = [
      { $match: matchConditions },
      { $count: 'total' }
    ];

    const [result, totalProjects] = await Promise.all([
      Project.aggregate(pipeline),
      Project.aggregate(totalProjectsPipeline)
    ]);

    const total = totalProjects.length > 0 ? totalProjects[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    return {
      status: 'success',
      data: {data : result, totalPages : totalPages},
      page,
      message: 'Projects retrieved successfully',
      statusCode: statusCode.success
    };

  } catch (err : any) {
    return {
      status: 'error',
      data: err?.message,
      message: 'Internal Server Error',
      statusCode: statusCode.serverError
    };
  }
};


// CREATE TASK FUNCTION
const findSingleTask = async(datas : any) => {
  try
  {
    const taskData = await Task.findOne({_id : datas.id, deletedAt : {$exists : false}})
    if(taskData)
    {
      return {
        status : 'success',
        data : taskData,
        message : 'Retrived task successfully',
        statusCode:statusCode.success
      }
    }
    else
    {
      return {
        status : 'error',
        data : 'Task does not exists',
        message : 'Task does not exists',
        statusCode:statusCode.info
      }
    }
  }
  catch(err : any)
  {
    return {
      status : 'error',
      data : err?.message,
      message : err?.message,
      statusCode:statusCode.info
    }
  }
}

const createTask = async(datas : any) => {
  try
  {
    const {status} = await getSingleProject({id : datas.projectId, company : datas.company})
    if(status === "success"){
      const newTask = new Task(datas)
      const savedTask = await newTask.save()
      return {
        status : 'success',
        data : savedTask,
        message : `${savedTask.title} task has been created successfully`,
        statusCode : statusCode.success
      }
    }
    else {
      return {
        status : 'error',
        data : 'Project does not exists',
        message : `Project does not exists`,
        statusCode : statusCode.info
      }
    }
  }
  catch(err : any)
  {
    return {
      status: 'error',
      data: err?.message,
      message: 'Internal Server Error',
      statusCode: statusCode.serverError
    };
  }
}

const updateTask = async(datas : any) => {
  try
  {
    const {status} = await getSingleProject({id : datas.projectId, company : datas.company})
    if(status === "success"){
      const {status : taskStatus} = await findSingleTask({id : datas.taskId})
      if(taskStatus === "success"){
        const updatedTask = await Task.findByIdAndUpdate(datas.taskId,{$set : datas},{new : true})
        return {
          data : updatedTask,
          status :'success',
          statusCode:statusCode.success,
          message : 'Task has been updated successfully'
        }
      }
      else {
        return {
          status : 'error',
          data : 'Task does not exists',
          message : `task does not exists`,
          statusCode : statusCode.info
        }
      }
    }
    else {
      return {
        status : 'error',
        data : 'Project does not exists',
        message : `Project does not exists`,
        statusCode : statusCode.info
      }
    }
  }
  catch(err : any)
  {
    return {
      status: 'error',
      data: err?.message,
      message: 'Internal Server Error',
      statusCode: statusCode.serverError
    };
  }
}

export { createProject, updateProject, getAllProjects, getSingleProject,createTask, updateTask };
