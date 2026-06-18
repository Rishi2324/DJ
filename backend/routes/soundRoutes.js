const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
  getAllSounds,
  addSound,
  deleteSound,
} = require("../controllers/soundController");

router.get("/", getAllSounds);

router.post("/", upload.single("audio"), addSound);

router.delete("/:id", deleteSound);

module.exports = router;