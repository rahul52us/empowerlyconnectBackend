import express from "express";
import authenticate from "../../modules/config/authenticate";
import { createOrderService } from "../../services/order/order.service";

const router = express.Router();

router.post("/create", authenticate, createOrderService);

export default router;