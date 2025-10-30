const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'please define your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please enter a password'],
    minlength: [8, 'Password must be more than 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (el) {
        // This only work with CREATE and SAVE!!
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// pre middleware to encrypt password before saving in the database.
userSchema.pre('save', async function (next) {
  // only run this function if password was actually modified.
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12.
  this.password = await bcrypt.hash(this.password, 12);

  // after we make a validation to confirm the password, we don't need to store it in our database.
  this.passwordConfirm = undefined;
  next();
});

// Pre middleware to update the changePasswordAt property after reset password.
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  return next();
});

// Pre query middleware of deleting a user (/^find/ --> apply this middleware on every query starts with 'find').
userSchema.pre(/^find/, function (next) {
  // this points to the current query (when we get all users it will get the only ones with active set to true).
  this.find({ active: { $ne: false } });
  next();
});

// Compare the password entered by user is the same as the password in database.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check if password changed after the token issued.
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    // change the time we chenged password on it into a time stamp.
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimeStamp < changedTimeStamp;
  }

  // False means NOT Changed.
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // (10 minutes) but converted to milliseconds.
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
