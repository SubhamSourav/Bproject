const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide product name"],
    trim: true,
    maxlength: [120, "product name should nnot be more than 120 character"],
  },
  price: {
    type: Number,
    required: [true, "please provide product price"],
    maxlength: [5, "product price should't be more than 6 digits"],
  },
  description: {
    type: String,
    required: [true, "Provide product description"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "please select category from short_sleeves, long-sleeves, sweat-shirts,hoodies",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
      message:
        "please select category from shortsleeves, longsleeves, sweatshirts,hoodies",
    },
  },
  brand: {
    type: String,
    required: [true, "please add a brand for clothing"],
  },

  stock: {
    type: Number,
    required: [true, "Please add a no in stock"],
  },
  rating: {
    type: Number,
    default: 0,
  },
  numberofReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      Comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
