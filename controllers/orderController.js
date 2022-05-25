const Order = require("../model/order");
const Product = require("../model/product");
const bigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");

exports.createOrder = bigPromise(async (req, res, next) => {
  const { shippingInfo, orderItems, paymentInfo } = req.body;

  for (let index = 0; index < orderItems.length; index++) {
    const item = await Product.findById(orderItems[index].product);

    orderItems[index].name = item.name;
    orderItems[index].image = item.photos[0].secure_url;
    orderItems[index].price = item.price;
  }

  const shippingAmount = 200;
  let totalAmount = shippingAmount;
  let taxAmount = 0;
  for (let index = 0; index < orderItems.length; index++) {
    const item = orderItems[index];
    let cost = item.quantity * item.price;
    let tax = cost * 0.1;
    taxAmount += tax;
    totalAmount += cost + tax;
  }

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email role"
  );

  if (!order) {
    return next(new CustomError("please check order id"), 401);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLoggedInOrder = bigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new CustomError("please check order id"), 401);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.admingetAllOrders = bigPromise(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "Delivered") {
    return next(new CustomError("Order is already marked for delivered", 401));
  }

  order.orderItems.forEach(async (prod) => {
    const product = await Product.findById(prod.product);
    if (prod.quantity > product.stock) {
      return res.status(401).json({
        error: `${prod.quantity} ${product.name} are needed, only ${product.stock} ${product.name} are available`,
      });
    }
  });

  order.orderStatus = req.body.orderStatus;
  order.orderItems.forEach(async (prod) => {
    await updateProductStock(prod.product, prod.quantity, next);
  });

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

exports.admindeleteOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

async function updateProductStock(productId, quantity, next) {
  const product = await Product.findById(productId);

  // if (quantity > product.stock) {
  //   return next(
  //     new CustomError(
  //       `${quantity} ${product.name} are needed, only ${product.stock} ${product.name} are available`
  //     )
  //   );
  // }
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}
