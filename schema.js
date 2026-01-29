const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().min(0),
  location: Joi.string().required(),
  country: Joi.string().required(),
  category: Joi.string().required(),
  image: Joi.any()
});

module.exports.reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required()
});
