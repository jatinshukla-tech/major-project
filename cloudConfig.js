require("dotenv").config(); // make sure env variables load

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // must match your actual Cloudinary dashboard
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET, // ✅ correct var name
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Explore-Hut_Dev",
    allowedFormats: ["png", "jpg", "jpeg", "gif", "tiff", "bmp", "pdf"],
  },
});

module.exports = { cloudinary, storage };
