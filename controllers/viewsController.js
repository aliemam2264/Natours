const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Global Alerts
exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  if (alert === 'booking') {
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  }
  next();
};

exports.viewAllTours = catchAsync(async (req, res, next) => {
  // 1) Get All Tours From Collection.
  const tours = await Tour.find();

  // 2) Build the Template in the overview.pug

  // 3) Render All Tours From Step 1).
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.viewTour = catchAsync(async (req, res, next) => {
  // 1) Get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build The Tmeplate in the tour.pug

  // 3) Render The Template using data from step 1).
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

// Login Form
exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login into your account',
  });
};

// Signup form
exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your Account',
  });
};

// Account Page
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

// Get user's booked tour.
exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings.
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs.
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

// Update User Data (only updating the user name and email).
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});
