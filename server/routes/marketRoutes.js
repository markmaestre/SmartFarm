const express = require('express');
const router = express.Router();
const Market = require('../models/Market');
const auth = require('../Middleware/auth');

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ➕ CREATE MARKET POST
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';

    if (req.file) {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req);
      imageUrl = result.secure_url;
    }

    const newMarket = new Market({
      userId: req.user.id,
      productName: req.body.productName,
      description: req.body.description,
      price: req.body.price,
      location: req.body.location,
      availableQuantity: req.body.availableQuantity,
      contactNumber: req.body.contactNumber,
      image: imageUrl,
    });

    await newMarket.save();
    res.status(201).json({ message: 'Market post created', post: newMarket });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error });
  }
});

// 📥 GET ALL MARKET POSTS
router.get('/', async (req, res) => {
  try {
    const posts = await Market.find().populate('userId', 'username email');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching market posts', error });
  }
});

// 🔍 GET SINGLE MARKET POST
router.get('/:id', async (req, res) => {
  try {
    const post = await Market.findById(req.params.id).populate('userId', 'username email');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error });
  }
});

// ✏️ UPDATE MARKET POST
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.existingImage || '';

    if (req.file) {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req);
      imageUrl = result.secure_url;
    }

    const updatedPost = await Market.findByIdAndUpdate(
      req.params.id,
      {
        productName: req.body.productName,
        description: req.body.description,
        price: req.body.price,
        location: req.body.location,
        availableQuantity: req.body.availableQuantity,
        contactNumber: req.body.contactNumber,
        image: imageUrl,
      },
      { new: true }
    );

    if (!updatedPost) return res.status(404).json({ message: 'Post not found' });

    res.json({ message: 'Post updated', post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error });
  }
});

// ❌ DELETE MARKET POST
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedPost = await Market.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ message: 'Post not found' });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error });
  }
});

module.exports = router;
