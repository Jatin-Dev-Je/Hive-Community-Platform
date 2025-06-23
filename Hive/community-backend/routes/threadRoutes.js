const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
  getThreads,
  getThreadById,
  createThread,
  updateThread,
  deleteThread,
  getThreadsByCategory,
  getFeaturedThreads,
  searchThreads
} = require('../controllers/threadController');

// Example route to verify it's working
router.get('/test', (req, res) => {
  res.json({ message: 'Thread routes working!' });
});

// All thread routes
router.get('/', optionalAuth, getThreads);
router.get('/:id', optionalAuth, getThreadById);
router.post('/', protect, createThread);
router.put('/:id', protect, updateThread);
router.delete('/:id', protect, deleteThread);
router.get('/category/:category', optionalAuth, getThreadsByCategory);
router.get('/featured', optionalAuth, getFeaturedThreads);
router.get('/search', optionalAuth, searchThreads);

module.exports = router; 