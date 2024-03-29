import { NextFunction, Response } from "express";
import Class from "../../schemas/Class/Class";
import Section from "../../schemas/Class/Section";
import { generateError } from "../config/function";
import { getClassesValidation } from "./utils/validation";

const Createclass = async (req: any, res: Response, next: NextFunction) => {
  try {
    req.body.company = req.bodyData.company;
    req.body.createdBy = req.userId;

    const classInstance = new Class({
      name: req.body.name,
      startYear: req.body.startYear,
      endYear: req.body.endYear,
      company: req.body.company,
      createdBy: req.body.createdBy,
      medium: req.body.medium,
    });

    const savedClass = await classInstance.save();

    if (Array.isArray(req.body.sections) && req.body.sections?.length) {
      req.body.sections.forEach((item: any) => {
        item.class = savedClass._id;
        item.createdBy = req.body.createdBy;
      });

      const insertedSections = await Section.create(req.body.sections, {
        insertedIds: true,
      });

      classInstance.sections = insertedSections.map((item) => item._id);

      await classInstance.save();
      res.status(201).send({
        message: `Create ${classInstance.name} Class has been created Successfully`,
        data: { ...savedClass.toObject(), sections: insertedSections },
        statusCode: 201,
        success: true,
      });
    }
  } catch (err) {
    next(err);
  }
};

const UpdateClass = async (req: any, res: Response, next: NextFunction) => {
  try {
    const classId = req.params.classId;
    const { name, startYear, endYear, sections, medium } = req.body;

    const classInstance = await Class.findById(classId);

    if (!classInstance) {
      throw generateError("Class Not Found", 400);
    }

    classInstance.name = name;
    classInstance.startYear = startYear;
    classInstance.endYear = endYear;
    classInstance.medium = medium;

    const updatedClass = await classInstance.save();

    if (sections && sections.length) {
      const updatedSections = await Promise.all(
        sections.map(async (section: any) => {
          if (section._id) {
            return Section.findByIdAndUpdate(
              section._id,
              { ...section },
              { new: true }
            );
          } else {
            section.class = classId;
            section.createdBy = req.userId;
            const newSection = new Section(section);
            return newSection.save();
          }
        })
      );

      updatedClass.sections = updatedSections.map((item) => item._id);
      await updatedClass.save();
      updatedClass.sections = updatedSections;
    }

    res.status(200).send({
      message: "Class updated successfully",
      data: updatedClass,
      statusCode: 200,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const getClasses = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { error } = getClassesValidation.validate(req.body);
    if (error) {
      throw generateError(error.details, 422);
    }

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 15;
    const skip = (page - 1) * pageSize;

    const classesQuery = Class.find({
      company: req.bodyData.company,
      startYear: { $gte: req.body.startYear },
      endYear: { $lte: req.body.endYear },
    })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("createdBy")
      .populate("sections");

    // Execute the query and retrieve the results as an array
    const classes = await classesQuery.exec();

    const totalClassesCount = await Class.countDocuments({
      company: req.bodyData.company,
      startYear: { $gte: req.body.startYear },
      endYear: { $lte: req.body.endYear },
    });

    const totalPages = Math.ceil(totalClassesCount / pageSize);

    return res.status(200).send({
      message: "Get Classes Successfully",
      data: { classes, totalPages },
      statusCode: 200,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export { Createclass, getClasses, UpdateClass };
