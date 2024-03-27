import express from "express";
import authenticate from "../modules/config/authenticate";
import { createTripService, getAllDayTripCountService, getTripsService, updateTripService } from "../services/trip/trip.service";

const router = express.Router();

router.post("/create", authenticate, createTripService);
router.get("/", authenticate, getTripsService);
router.put('/:id',authenticate,updateTripService)
router.get('/tripcounts',authenticate,getAllDayTripCountService)

export default router;