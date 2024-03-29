import express from "express";
import authenticate from "../modules/config/authenticate";
import { createTripService, getAllDayTripCountService, getTripCountService, getTripsService, updateTripService } from "../services/trip/trip.service";

const router = express.Router();

router.post("/create", authenticate, createTripService);
router.get("/", authenticate, getTripsService);
router.put('/:id',authenticate,updateTripService)
router.get('/tripcounts',authenticate,getAllDayTripCountService)
router.get('/total/count',authenticate,getTripCountService)

export default router;