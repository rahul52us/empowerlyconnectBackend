import mongoose from "mongoose";
import { generateError } from "../../config/Error/functions";
import Blog from "../../schemas/Blog/BlogSchema";
import { statusCode } from "../../config/helper/statusCode";
import { createCatchError } from "../../config/helper/function";

const createBlog = async (data: any) => {
  try {
    const createdBlog = new Blog({
      coverImage: data.coverImage,
      title: data.title,
      content: data.content,
      tags: data.tags,
      status: data.status,
      createdBy: data.createdBy,
      company: data.company
    });

    const savedBlog = await createdBlog.save();
    return {
      status : 'success',
      statusCode : statusCode.success,
      data : savedBlog,
      message : `${data.title} blog has been created successfully`
    }
  } catch (err: any) {
    return createCatchError(err)
  }
};

const getBlogs = async (data: any) => {
  try {
    const blogs = await Blog.find({company : {$in : data.company}})
      .populate({
        path: "createdBy",
        select: "name username _id pic position createdAt",
      })
      .populate({
        path: "comments",
        select: "_id",
      })
      .select("title coverImage createdAt tags createdBy comments reactions")
      .sort({ createdAt: -1 })
      .skip((data.page - 1) * data.limit)
      .limit(data.limit);

    const totalCount = await Blog.countDocuments();
    const totalPages = Math.ceil(totalCount / data.limit);

    return {
      status: "success",
      message : 'Retrived blogs successfully',
      statusCode:statusCode.success,
      data: {
        totalPages: totalPages,
        data: blogs,
        currentPage: data.page,
      },
    };
  } catch (err) {
    return createCatchError(err)
  }
};

const getBlogById = async (data: any) => {
  try {
    let match: any = {};

    if (data.blogId) {
      match["_id"] = new mongoose.Types.ObjectId(data.blogId);
    }

    if (data.title) {
      match["title"] = {
        $regex: data.title,
        $options: "i"
      };
    }

    const blog = await Blog.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "createdBy",
          as: "createdBy",
        },
      },
      {
        $addFields: {
          createdBy: { $ifNull: [{ $arrayElemAt: ["$createdBy", 0] }, null] },
          reactions: { $size: "$reactions" },
        },
      },
      {
        $project: {
          title: 1,
          coverImage: 1,
          content: 1,
          tags: 1,
          status: 1,
          createdAt: 1,
          createdBy: {
            name: 1,
            username: 1,
            _id: 1,
            pic: 1,
            position: 1,
            createdAt: 1,
            bio: 1,
          },
          reactions: 1,
        },
      },
    ]);

    if (!blog || blog.length === 0) {
      throw generateError(`BLOG DOES NOT EXISTS`, 400);
    }
    return { status: "success", data: blog[0] };
  } catch (err) {
    return { status: "error", data: err };
  }
};

export { createBlog, getBlogs, getBlogById };
