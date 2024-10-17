import express from "express";
import authenticate from "../../modules/config/authenticate";
import { createOrderService, getUserOrderService } from "../../services/order/order.service";

const router = express.Router();

router.post("/create", authenticate, createOrderService);
router.post('/get',authenticate,getUserOrderService)

export default router;