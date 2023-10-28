import generateToken from "../config/helper/generateToken";
import { generateError } from "../config/Error/functions";
import User from "../schemas/User";

const findUserByUserName = async (data: any) => {
  try {
    const user = await User.findOne({ username: data.username });
    if (user) {
      return user
    }
    return null
  } catch (err: any) {
    return null
  }
};

const loginUser = async (data: any): Promise<any> => {
  try {
    const existUser = await User.findOne({ username: data.username }).populate(
      "profile_details"
    );
    if (!existUser) {
      throw generateError(`${data.username} user does not exist`, 401);
    }

    const { password, ...userData } = existUser.toObject();
    if (password !== data.password) {
      throw generateError(`Invalid username and password`, 400);
    }

    const responseUser = {
      ...userData,
      authorization_token: generateToken({ userId: userData._id }),
    };

    return { status: "success", data: responseUser };
  } catch (err) {
    return { status: "error", data: err };
  }
};

const changePassword = async (data: any) => {
  try {
    const user = await User.findById(data.user);
    if (user) {
      if (!(user.password === data.oldPassword)) {
        throw generateError(
          `Current Password does not match to the Old Password`,
          400
        );
      }
      user.password = data.newPassword;
      await user.save();
      return { status: "success", data: null };
    } else {
      return { status: "error", data: "User Does not exists" };
    }
  } catch (err) {
    return { status: "error", data: err };
  }
};

export { loginUser, changePassword,findUserByUserName };
