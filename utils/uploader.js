const cloudinary = require("cloudinary");

module.exports = async (filepath) => {
  return cloudinary.v2.uploader.upload(filepath, {
    folder: "products",
  });
};
