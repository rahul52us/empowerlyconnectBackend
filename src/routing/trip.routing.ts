import express from "express";
import authenticate from "../modules/config/authenticate";
import { createTripService, getAllDayTripCountService, getSingleTripService, getTripCountService, getTripsService, updateTripService } from "../services/trip/trip.service";

const router = express.Router();

router.post("/create", authenticate, createTripService);
router.post("/", authenticate, getTripsService);
router.get('/single/:id',authenticate,getSingleTripService)
router.put('/:id',authenticate,updateTripService)
router.post('/tripcounts',authenticate,getAllDayTripCountService)
router.post('/total/count',authenticate,getTripCountService)

export default router;