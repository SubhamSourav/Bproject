const express = require("express");
const {
  createOrder,
  getOneOrder,
  getLoggedInOrder,
  admingetAllOrders,
  admindeleteOrder,
} = require("../controllers/orderController");
const router = express.Router();
const { isLoggedIn, CustomRole } = require("../middleware/user");

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
router.route("/myorder").get(isLoggedIn, getLoggedInOrder);

router
  .route("/admin/orders")
  .get(isLoggedIn, CustomRole("admin"), admingetAllOrders);

router
  .route("/admin/order/:id")
  .put(isLoggedIn, CustomRole("admin"), admingetAllOrders)
  .delete(isLoggedIn, CustomRole("admin"), admindeleteOrder);

module.exports = router;
