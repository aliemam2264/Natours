const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// Set Tour and User IDs Middleware
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes.
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Get All Reviews
exports.getAllReviews = factory.getAll(Review);

// Get One Review.
exports.getOneReview = factory.getOne(Review);

// Create A Review
exports.createReview = factory.createOne(Review);

// Update A Review
exports.updateReview = factory.updateOne(Review);

// Delete A Review
exports.deleteReview = factory.deleteOne(Review);
