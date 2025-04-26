import * as Joi from "joi";

const testimonialCreateValidation = Joi.object({
  name: Joi.string().required().trim().min(2).max(50).messages({
    "any.required": "Name is required",
    "string.empty": "Name is required",
    "string.min": "Name must be at least {#limit} characters long",
    "string.max": "Name cannot exceed {#limit} characters",
  }),
  rating: Joi.number().required().min(1).max(5).messages({
    "any.required": "rating is required",
    "string.empty": "rating is required",
    "string.min": "rating must be at least {#limit} characters long",
    "string.max": "rating cannot exceed {#limit} characters",
  }),
  user: Joi.string().required().messages({
    "any.required": "User is required",
    "string.empty": "User is required",
  }),
  company: Joi.any().allow(null).messages({
    "any.required": "Organisation is required",
    "string.empty": "Organisation is required",
  }),
  profession: Joi.string(),
  image: Joi.any(),
  description: Joi.string(),
}).options({
  abortEarly: false,
});

export { testimonialCreateValidation };
