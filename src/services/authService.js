const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sha256 = require("sha256");
const sgMail = require("@sendgrid/mail");
const gravatar = require("gravatar");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { User } = require("../db/userModel");
const { Verification } = require("../db/verificationModel");
const { NotAuthorizedError, UserConflictError } = require("../helpers/errors");

const registration = async (email, password) => {
  const existingUser = await User.findOne({ email });
  const avatarURL = gravatar.url(email);
  const verificationToken = sha256(email + process.env.JWT_SECRET);

  if (existingUser) {
    throw new UserConflictError(`User with email: ${email} already exists`);
  }

  const user = new User({ email, password, avatarURL });
  await user.save();

  const verification = new Verification({
    verificationToken,
    userId: user._id,
  });
  await verification.save();

  const msg = {
    to: email,
    from: "ruslan.nadirovich@gmail.com",
    subject: "Confirm your email address",
    text: `Please, confirm your email address by sending a POST request at http://localhost:${process.env.PORT}/api/auth/verify/${verificationToken}`,
    html: `Please, confirm your email address by sending a POST request at http://localhost:${process.env.PORT}/api/auth/verify/${verificationToken}`,
  };

  await sgMail.send(msg);
  return user;
};

const registrationResend = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotAuthorizedError("No user found");
  }

  const verification = await Verification.findOne({
    userId: user._id,
    active: true,
  });

  if (!verification) {
    throw new NotAuthorizedError("Verification has already been passed");
  }

  const msg = {
    to: email,
    from: "ruslan.nadirovich@gmail.com",
    subject: "Confirm your email address",
    text: `Please, confirm your email address by sending a POST request at http://localhost:${process.env.PORT}/api/auth/verify/${verification.verificationToken}`,
    html: `Please, confirm your email address by sending a POST request at http://localhost:${process.env.PORT}/api/auth/verify/${verification.verificationToken}`,
  };

  await sgMail.send(msg);
};

const verification = async (verificationToken) => {
  const verification = await Verification.findOne({
    verificationToken,
    active: true,
  });

  if (!verification) {
    throw new NotAuthorizedError("Verification is invalid or expired");
  }

  const user = await User.findById(verification.userId);

  if (!user) {
    throw new NotAuthorizedError("No user found");
  }

  verification.active = false;
  await verification.save();

  user.verified = true;
  await user.save();

  const msg = {
    to: user.email,
    from: "ruslan.nadirovich@gmail.com",
    subject: "Thank you for registration!",
    text: `Email address ${user.email} is now verified. Thank you!`,
    html: `Email address ${user.email} is now verified. Thank you!`,
  };

  await sgMail.send(msg);
};

const login = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new NotAuthorizedError(`No user with email ${email} was found`);
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new NotAuthorizedError(`Password is incorrect`);
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  user.token = token;
  await user.save();
  return { user, token };
};

const logout = async (userId) => {
  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new NotAuthorizedError(`No user with email ${userId} was found`);
  }

  user.token = "";
  await user.save();
};

const current = async (userId) => {
  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new NotAuthorizedError(`No user with email ${userId} was found`);
  }
  return user;
};

module.exports = {
  registration,
  registrationResend,
  verification,
  login,
  logout,
  current,
};
