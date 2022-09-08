const Review = require('../models/reviewModel');
//const AppError = require('../utils/appError');

exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    res
      .status(200)
      .json({ status: 'success', results: reviews.length, reviews });
  } catch (err) {
    res.status(400).json({ status: 'fail', err });
  }
};

exports.createReview = async (req, res, next) => {
  try {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const review = await Review.create({
      review: req.body.review,
      rating: req.body.rating,
      createdAt: req.body.createdAt,
      tour: req.body.tour,
      user: req.body.user,
    });

    res.status(200).json({ status: 'success', review });
  } catch (err) {
    res.status(400).json({ status: 'fail', err });
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    res.status(200).json({ status: 'success', review });
  } catch (err) {
    res.status(400).json({ status: 'fail', err });
  }
};

exports.deleteReview = async (req, res, next) => {};

exports.updateReview = async (req, res, next) => {};
