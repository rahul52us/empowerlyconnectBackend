import { createCatchError } from "../../config/helper/function";
import { statusCode } from "../../config/helper/statusCode";
import BookCategory from "../../schemas/Liberary/BookCategory.schema";
import { deleteFile, uploadFile } from "../uploadDoc.repository";

export const createBookCategory = async (data: any) => {
  try {
    const category = new BookCategory(data);
    const savedCategory = await category.save();

    if(data.coverImage && data.coverImage?.buffer && data.coverImage?.filename && data.coverImage?.isAdd){
      const uploadedData = await uploadFile({...data.coverImage})
      savedCategory.coverImage = {
        name : data.coverImage.filename,
        url : uploadedData,
        type : data.coverImage.type
      }
      await savedCategory.save()
    }

    return {
      status: "success",
      data: savedCategory,
      statusCode: statusCode.create,
      message: `${data.title} category has been created successfully`,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const findOneCategory = async (data: any) => {
  try {
    const bookData: any = await BookCategory.findOne(data);
    if (bookData) {
      return {
        data: bookData,
        status: "success",
        message: "retrived book category",
        statusCode: statusCode.success,
      };
    } else {
      return {
        data: "Category not Found",
        status: "error",
        message: "Category not Found",
        statusCode: statusCode.info,
      };
    }
  } catch (err) {
    return createCatchError(err);
  }
};

export const updateBookCategory = async (data: any) => {
  try {
    const { status } = await findOneCategory({
      _id: data.id,
      company: data.company,
      deletedAt: { $exists: false },
    });

    if (status === "success") {
      const {coverImage,...rest} = data
      const updatedCategory : any = await BookCategory.findByIdAndUpdate(
        data.id,
        { $set: {...rest} },
        { new: true }
      );

      if(updatedCategory?.coverImage?.name && data?.coverImage?.isDeleted)
        {
            await deleteFile(
              updatedCategory?.coverImage.name
            );
            await updatedCategory.save()
        }

        if(coverImage && coverImage?.buffer && coverImage?.filename && coverImage?.isAdd){
          const uploadedData = await uploadFile({...coverImage})
          updatedCategory.coverImage = {
            name : coverImage.filename,
            url : uploadedData,
            type : coverImage.type
          }
          await updatedCategory.save()
        }

      return {
        data: updatedCategory,
        message: "Category has been updated",
        statusCode: statusCode.success,
        status: "success",
      };
    } else {
      return {
        data: "Category not Found",
        status: "error",
        message: "Category not Found",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getAllBookCategory = async (data: any) => {
  try {
    const { company, page = 1, limit = 10 } = data;

    const skip = (page - 1) * limit;

    let pipeline: any[] = [];

    pipeline.push({
      $match: {
        deletedAt: { $exists: false },
        company: {$in : company}
      }
    });

    const totalCategoriesPipeline = [...pipeline, { $count: "total" }];
    const totalCategoriesResult = await BookCategory.aggregate(totalCategoriesPipeline);
    const totalCategories = totalCategoriesResult.length > 0 ? totalCategoriesResult[0].total : 0;

    const totalPages = Math.ceil(totalCategories / limit);

    pipeline.push({
      $skip: skip
    });

    pipeline.push({
      $limit: limit
    });

    const result = await BookCategory.aggregate(pipeline);
    return {
      status: "success",
      data: {data : result, totalPages : totalPages},
      message: "Category has been retrieved successfully",
      statusCode: statusCode.success
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getAllBookCategoryCounts = async (data : any) => {
  try
  {
     const pipeline : any = []
     pipeline.push({
      $match : {
        company : {$in : data.company},
        deletedAt : {$exists : false}
      }
     })

     pipeline.push({
      $count : 'totalBooksCategory'
     })

     const result = await BookCategory.aggregate(pipeline)
     return {
      data: result[0] ? result[0].totalBooksCategory : 0,
      message : 'Retrived Books Category Counts',
      statusCode : statusCode.success,
      status : 'success'
     }
  }
  catch(err : any)
  {
    return createCatchError(err)
  }
}

export const getAllBookCategoryTitleCounts = async (data: any) => {
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
        _id: '$title',
        count: { $sum: 1 }
      }
    });

    pipeline.push({
      $project: {
        _id: 0,
        title: '$_id',
        count: 1
      }
    });

    const result = await BookCategory.aggregate(pipeline);

    return {
      data: result,
      message: 'Retrieved Book Category Counts by Title',
      statusCode: statusCode.success,
      status: 'success'
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};
