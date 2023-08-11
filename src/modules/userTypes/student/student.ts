import { NextFunction, Response } from "express";
import {
  createStudentValidation,
  getStudentsValidation,
} from "./utils/validation";
import { generateError } from "../../../modules/config/function";
import User from "../../../schemas/User";
import ProfileDetails from "../../../schemas/ProfileDetails";
import Student from "../../../schemas/UserTypes/StudentSchema";
import MarkSheet from "../../../schemas/MarkSheet/markSheet";

const createStudent = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { error, value } = createStudentValidation.validate(req.body);

    if (error) {
      throw generateError(error.details, 422);
    }

    const user = await User.findOne({ username: value.username });
    if (user) {
      throw generateError(`${user.username} user is already exists`, 400);
    }

    const createdUser = new User({
      username: value.username,
      name: value.name,
      organisation: req.bodyData.organisation,
      pic: value.pic,
      password: value.password,
      is_active: true,
    });

    const savedUser = await createdUser.save();

    if (!savedUser) {
      throw generateError(`cannot create the user`, 400);
    }

    const profile = new ProfileDetails({
      user: savedUser._id,
      fatherName: value.fatherName,
      motherName: value.motherName,
      language: value.language,
      nickName: value.nickName,
      sibling: value.sibling,
      mobileNo: value.mobileNo,
      emergencyNo: value.emergencyNo,
      addressInfo: value.addressInfo,
    });

    const savedProfile = await profile.save();
    savedUser.profile_details = savedProfile._id;
    await savedUser.save();

    const createStudent = new Student({
      user: savedUser._id,
      organisation: req.bodyData.organisation,
      class: value.class,
      section: value.section,
    });

    const savedStudent = await createStudent.save();
    const markSheet = new MarkSheet({
      organisation: req.bodyData.organisation,
      student: savedStudent._id,
    });

    const savedMarkSheet = await markSheet.save();

    savedStudent.marksheet = savedMarkSheet._id;
    await savedStudent.save();

    const { password, ...restUser } = savedUser.toObject();

    res.status(200).send({
      message: "CREATE STUDENT SUCCESSFULLY",
      statusCode: 201,
      data: {
        ...restUser,
        profile_details: savedProfile.toObject(),
        student: savedStudent.toObject(),
        markSheet: savedMarkSheet.toObject(),
      },
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const getStudents = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { error, value } = getStudentsValidation.validate(req.body);

    if (error) {
      throw generateError(error.details, 422);
    }

    const page = req.query.page || 1;
    const perPage = 10;

    const totalCount = await Student.countDocuments({
      organisation: req.bodyData.organisation,
      section: value.section,
    });

    const totalPages = Math.ceil(totalCount / perPage);

    const students = await Student.find({
      organisation: req.bodyData.organisation,
      section: value.section,
    })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).send({
      message: "Get Successfully Students Data",
      data: { students, totalPages, currentPage: page },
      statusCode: 200,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    next(err);
  }
};

export { createStudent, getStudents };
