import * as Joi from "joi";

const createValidation = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.min": "Name must have a minimum length of {#limit}",
    "string.max": "Name should not exceed a maximum length of {#limit}",
    "any.required": "Name is required",
  }),
  company_name: Joi.string().min(3).max(30).required().messages({
    "string.min": "company name must have a minimum length of {#limit}",
    "string.max":
      "company name should not exceed a maximum length of {#limit}",
    "any.required": "company is required",
  }),
  password: Joi.string()
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
    .message(
      "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, and one digit."
    )
    .required(),
}).options({
  abortEarly : false
});

export { createValidation };
