import { TripModel as Trip } from "../schemas/trip/trip.schema";

export const createTrip = async (data: any) => {
  try {
    const trip = new Trip(data);
    const savedTrip = await trip.save();
    return {
      status: "success",
      data: savedTrip,
    };
  } catch (err : any) {
    throw new Error(err);
  }
};

export const getTrips = async (data : any) => {
    try
    {
        const trips = await Trip.find({company : data.company})
        return {
            data : trips,
            status : 'success'
        }
    }
    catch(err : any)
    {
        throw new Error(err)
    }
}