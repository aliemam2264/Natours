const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Define multer in disk storage.
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-userId-timestamp (user-10655bcdf85-365643325.jpeg)
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// Define multer in memory storage as buffer
const multerStorage = multer.memoryStorage();

// Define multer filter (filtering file which accept only images file).
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! please upload only images.', 400), false);
  }
};

// Upload function with storage and filter.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

// Resize user photo middleware.
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // sharp is only works on buffer so that's the reason we save file in memory storage not disk storage.
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// the filtered fields we want to update function
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get the current user using '/me' endpoint (middleware).
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Updating Current User.
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update, Please use /updateMyPassword.',
        400,
      ),
    );
  }

  // 2) here we filter the only fields we want to update.
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename; // Store image name to the database.

  // 3) Update User Document.
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// DeletingCurrent User (or deactivate his document in our database).
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Create a New User
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route handlers is not defined / Please Signup instead.',
  });
};

// Get All Users
exports.getAllUsers = factory.getAll(User);

// Get One User By Id
exports.getOneUser = factory.getOne(User);

// Update A User
exports.updateUser = factory.updateOne(User);

// Delete A User
exports.deleteUser = factory.deleteOne(User);
