const express = require("express");
const {
  testproduct,
  addProduct,
  getAllproduct,
  adminGetAllproducts,
  getOneProduct,
  adminupdateOneProduct,
  adminDeleteOneProduct,
  addReview,
  deleteReview,
  getOnlyReviewsForOneProduct,
} = require("../controllers/productcontroller");
const router = express.Router();

const { isLoggedIn, CustomRole } = require("../middleware/user");

//user route
router.route("/products").get(getAllproduct);
router.route("/product/:id").get(getOneProduct);
router.route("/review").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/reviews").get(getOnlyReviewsForOneProduct);

//admin route
router
  .route("/admin/product/add")
  .post(isLoggedIn, CustomRole("admin"), addProduct);
router
  .route("/admin/products")
  .get(isLoggedIn, CustomRole("admin"), adminGetAllproducts);
router
  .route("/admin/product/:id")
  .put(isLoggedIn, CustomRole("admin"), adminupdateOneProduct)
  .delete(isLoggedIn, CustomRole("admin"), adminDeleteOneProduct);

module.exports = router;
