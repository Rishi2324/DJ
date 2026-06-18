const Sound = require("../models/Sound");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const getAllSounds = async (req, res) => {
  try {
    const sounds = await Sound.find().sort({ createdAt: -1 });
    res.json(sounds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSound = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Audio file is required",
      });
    }

    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "dj-sounds",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await uploadStream();

    const sound = await Sound.create({
      title,
      category,
      audioUrl: result.secure_url,
    });

    res.status(201).json(sound);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};
const deleteSound = async (req, res) => {
  try {
    await Sound.findByIdAndDelete(req.params.id);

    res.json({
      message: "Sound deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAllSounds,
  addSound,
  deleteSound,
};