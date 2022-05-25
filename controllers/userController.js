const User = require("../model/user");
const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const filUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const bigPromise = require("../middleware/bigPromise");
const mailHelper = require("../utils/emailhelper");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  if (!req.files) {
    return next(new CustomError("Photo is required for signup", 400));
  }

  let file = req.files.photo;
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const { name, email, password } = req.body;

  if (!name) {
    return next(new CustomError("Name is Required", 400));
  }

  if (!email) {
    return next(new CustomError("Email is Required", 400));
  }

  if (!password) {
    return next(new CustomError("Password is Required", 400));
  }

  // return next(new Error("Name, email and password are required"));

  try {
    const user = await User.create({
      name,
      email,
      password,
      photo: {
        id: result.public_id,
        secure_url: result.secure_url,
      },
    });
    cookieToken(user, res, "User Created");
  } catch (error) {
    await cloudinary.v2.uploader.destroy(result.public_id);
    return next(new CustomError(error.message, 400));
  }
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  //check for presence of email and password
  if (!email || !password) {
    return next(new CustomError("please provide email and password", 400));
  }

  //get user from db
  const user = await User.findOne({ email }).select("+password");

  //if user not found in db
  if (!user) {
    return next(
      new CustomError("Email or password does not match or exist", 400)
    );
  }

  const ispassword = await user.isValidatedPassword(password);

  //if password dont match
  if (!ispassword) {
    return next(
      new CustomError("Email or password does not match or exist", 400)
    );
  }

  //if all goes good we will send the token
  cookieToken(user, res, "Successfully logged-In");
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("Email not found as registered", 400));
  }

  const forgotToken = user.getForgetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `copy paste this link in your URL & hit enter \n\n ${myUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: "T-Store password reset email",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new CustomError(error.message, 500));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or expired", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("Password and confirm password do not match", 400)
    );
  }

  user.password = req.body.password;

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  //send a JSON response or a token
  cookieToken(user, res, "Password Changed Successfully");
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id); //we injected
  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  const isCorrectOldPassword = await user.isValidatedPassword(
    req.body.oldpassword
  );

  if (!isCorrectOldPassword) {
    return next(new CustomError("old password is incorrect", 400));
  }

  user.password = req.body.password;
  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  //add a check for email and name in body

  let newData = {};

  if (!req.body.name) newData.name = user.name;
  else newData.name = req.body.name;

  if (!req.body.email) newData.email = user.email;
  else newData.email = req.body.email;

  if (req.files) {
    const user = await User.findById(req.user.id);
    //delete pic on cloudinary
    const imageid = user.photo.id;
    const response = await cloudinary.v2.uploader.destroy(imageid);
    //uploading new pic
    const result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    userFindAndModify: false,
  });

  cookieToken(user, res);
});

exports.adminAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

exports.admingetOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    next(new CustomError("No user found", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminupdateOneUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    userFindAndModify: false,
  });

  await user.save();

  res.status(200).json({
    success: true,
  });
});

exports.admindeleteoneuser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No such user found", 401));
  }

  const name = user.name;
  const imageid = user.photo.id;

  await cloudinary.v2.uploader.destroy(imageid);

  await user.remove();
  res.status(200).json({
    success: true,
    message: `${name} is removed`,
  });
});

exports.managerAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });

  users.forEach((user) => {
    user.role = undefined;
    user.createdAt = undefined;
  });

  res.status(200).json({
    success: true,
    users,
  });
});
