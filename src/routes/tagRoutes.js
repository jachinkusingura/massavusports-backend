const express = require('express');
const tagController = require('../controllers/tagController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(tagController.getAllTags)
  .post(protect, tagController.createTag);

router
  .route('/:id')
  .put(protect, tagController.updateTag)
  .delete(protect, tagController.deleteTag);

module.exports = router;
