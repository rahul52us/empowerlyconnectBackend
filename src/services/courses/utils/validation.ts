import Joi from "joi";

const customMessages = {
  "string.empty": "{#label} is required",
  "any.required": "{#label} is required",
  "string.min": "{#label} should be at least {#limit} characters",
  "string.max": "{#label} should be at most {#limit} characters",
  "number.min": "{#label} should be at least {#limit}",
  "number.max": "{#label} should be at most {#limit}",
};

export const notesCategoryValidation = Joi.object({
  company: Joi.any().required().allow(null).messages(customMessages),
  thumbnail: Joi.any().allow(),
  title: Joi.string().trim().required().min(2).max(180).messages(customMessages),
  description: Joi.string().trim().required().min(10).max(220).messages(customMessages),
  details: Joi.string().trim(),
  startYear: Joi.string().trim().required().min(2).max(180).messages({
    ...customMessages,
    "any.required": "Start Year is required",
  }),
  endYear: Joi.string().trim().required().min(2).max(180).messages({
    ...customMessages,
    "any.required": "End Year is required",
  }),
  discountPrice: Joi.string().trim().max(10).messages(customMessages),
  originalPrice: Joi.string().trim().max(10).messages(customMessages),
  rating: Joi.number().min(1).max(5).messages(customMessages),
  createdBy: Joi.string().required(),
  amountType: Joi.string().trim().max(10).messages(customMessages),
  pricingType: Joi.string().valid("paid", "free").default("free"),
}).options({ abortEarly: false });


export const MainNotesCreateValidation = Joi.object({
  title: Joi.string().trim().required().min(3).max(100).messages({
    "string.base": "Title must be a string.",
    "string.empty": "Title is required.",
    "string.min": "Title must be at least {#limit} characters long.",
    "string.max": "Title cannot be more than {#limit} characters long.",
    "any.required": "Title is required.",
  }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string.",
    "string.empty": "Description is required.",
    "any.required": "Description is required.",
  }),

  thumbnail: Joi.any().allow(),

  class: Joi.string().messages({
    "string.base": "Class must be a string.",
    "string.empty": "Class is required.",
  }),

  section: Joi.string().messages({
    "string.base": "Section must be a string.",
    "string.empty": "section is required.",
  }),

  categories: Joi.array().items(notesCategoryValidation).messages({
    "array.base": "Categories must be an array.",
    "array.min": "At least one category is required.",
    "any.required": "Categories array is required.",
  }),
});


export const notesCreateValidation = Joi.object({
  company: Joi.any().required().allow(null).messages(customMessages),

  category: Joi.any().required().allow(null).messages(customMessages),

  thumbnail: Joi.string().trim(),

  pdf: Joi.string().trim(),

  title: Joi.string().trim().required().min(2).max(180).messages(customMessages),

  startYear: Joi.string().trim().required().min(2).max(180).messages({
    ...customMessages,
    "any.required": "Start Year is required",
  }),

  endYear: Joi.string().trim().required().min(2).max(180).messages({
    ...customMessages,
    "any.required": "End Year is required",
  }),

  description: Joi.string().trim().required().min(10).max(420).messages(customMessages),

  details: Joi.string().trim(),

  discountPrice: Joi.string().trim().max(10).messages(customMessages),

  originalPrice: Joi.string().trim().max(10).messages(customMessages),

  rating: Joi.number().min(1).max(5).messages(customMessages),

  createdBy: Joi.string().required(),

  amountType: Joi.string().trim().max(10).messages(customMessages),

  pricingType: Joi.string().valid("paid", "free").default("free"),
}).options({ abortEarly: false });
