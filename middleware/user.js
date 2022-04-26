const User = require("../model/user");
const CustomError = require("../utils/customError");
const bigPromise = require("../middleware/bigPromise");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = bigPromise(async (req, res, next) => {
  const token =
    req.cookies.token ||
    req.body.token ||
    req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return next(new CustomError("Login first to access this page", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);
  next();
});

exports.CustomRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError("You are not allowed for this resource", 403)
      );
    }
    next();
  };
};
