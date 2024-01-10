import { generateError } from "../config/Error/functions";
import { TripModel as Trip } from "../schemas/trip/trip.schema";
import { uploadFile } from "./uploadDoc.repository";

export const createTrip = async (data: any) => {
  try {
    const trip = new Trip(data);
    const savedTrip = await trip.save();

    if (data.thumbnail && data.thumbnail?.trim !== "") {
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
    };
  } catch (err: any) {
    throw new Error(err);
  }
};

export const updateTrip = async (data: any) => {
  try {
    const updatedData : any = await Trip.findByIdAndUpdate(data._id, data, {
      new: true,
    });
    if (updatedData) {
      if (data.deletedFile === 1) {
        if (data.thumbnail && data.thumbnail?.trim !== "") {
          let url = await uploadFile(data.thumbnail);
          updatedData.thumbnail = {
            name: data.thumbnail.filename,
            url: url,
            type: data.thumbnail.type,
          };
          await updatedData.save();
        }
      }
      return {
        status: "success",
        data: updatedData,
      };
    } else {
      return {
        status: "error",
        data: "Trip does not exists",
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const getTrips = async (data: any) => {
  try {
    const trips = await Trip.find();
    return {
      data: trips,
      status: "success",
    };
  } catch (err: any) {
    throw new Error(err);
  }
};
