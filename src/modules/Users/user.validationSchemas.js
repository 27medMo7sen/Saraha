import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const SignUpSchema = {
  body: joi
    .object({
      firstname: joi.string().required(),
      lastname: joi.string().required(),
      username: joi
        .string()
        .pattern(new RegExp("^[a-zA-Z][a-zA-Z0-9_.]{2,29}$"))
        .required(),
      email: generalFields.email,
      password: generalFields.password,
      cPassword: joi.valid(joi.ref("password")).required(),
      gender: joi.string().optional(),
      age: joi.number().min(18).max(100).required(),
      country: joi.string().allow("").optional(),
      state: joi.string().allow("").optional(),
      phoneNumber: joi.string().optional(),
    })
    .required(),
};
export const UpdateProfileSchema = {
  body: joi
    .object({
      firstname: joi.string().optional(),
      lastname: joi.string().optional(),
      username: joi
        .string()
        .pattern(new RegExp("^[a-zA-Z][a-zA-Z0-9_.]{2,29}$"))
        .optional(),
      password: generalFields.password.optional(),
      cPassword: joi.valid(joi.ref("password")).optional(),
      gender: joi.string().optional(),
      bio: joi.string().optional(),
      age: joi.number().min(18).max(100).optional(),
      country: joi.string().allow("").optional(),
      state: joi.string().allow("").optional(),
      phoneNumber: joi.string().optional(),
    })
    .required(),
};
