const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUser,
  managerAllUser,
  admingetOneUser,
  adminupdateOneUserDetails,
  admindeleteoneuser,
} = require("../controllers/userController");

const { isLoggedIn, CustomRole } = require("../middleware/user");
const { route } = require("./home");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userDashBoard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userDashBoard/update").post(isLoggedIn, updateUserDetails);

//Admin Routes
router.route("/admin/users").get(isLoggedIn, CustomRole("admin"), adminAllUser);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, CustomRole("admin"), admingetOneUser)
  .put(isLoggedIn, CustomRole("admin"), adminupdateOneUserDetails)
  .delete(isLoggedIn, CustomRole("admin"), admindeleteoneuser);

router
  .route("/manager/users")
  .get(isLoggedIn, CustomRole("manager"), managerAllUser);

module.exports = router;
