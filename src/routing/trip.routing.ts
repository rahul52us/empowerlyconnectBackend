import express from "express";
import authenticate from "../modules/config/authenticate";
import { createTripService, getAllDayTripCountService, getSingleTripService, getTripCountService, getTripsService, totalTripTypeCountService, totalTripUserTypeCountService, updateTripService } from "../services/trip/trip.service";

const router = express.Router();

router.post("/create", authenticate, createTripService);
router.post("/", authenticate, getTripsService);
router.get('/single/:id',authenticate,getSingleTripService)
router.put('/:id',authenticate,updateTripService)
router.post('/tripcounts',authenticate,getAllDayTripCountService)
router.post('/total/count',authenticate,getTripCountService)
router.post('/types/total/count',authenticate,totalTripTypeCountService)
router.post('/user/types/total/count',authenticate,totalTripUserTypeCountService)

export default router;