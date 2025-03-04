import authenticate from "../modules/config/authenticate";
import { createTestimonail, getTestimonials, updateTestimonial } from "../modules/Testimonial/Testimonial";
import express from 'express'

const router = express.Router()
router.post('/create',authenticate,createTestimonail)
router.put('/:id',authenticate,updateTestimonial)
router.get(`/get`,getTestimonials)
export default router;