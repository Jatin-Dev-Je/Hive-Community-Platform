const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
  getRepliesByPost,
  getReplyById,
  createReply,
  updateReply,
  deleteReply,
  likeReply,
  dislikeReply,
  markHelpful,
  unmarkHelpful
} = require('../controllers/replyController');

/**
 * @swagger
 * /api/replies/post/{postId}:
 *   get:
 *     summary: Get all replies for a post
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
 */
router.get('/post/:postId', optionalAuth, getRepliesByPost);

/**
 * @swagger
 * /api/replies/{id}:
 *   get:
 *     summary: Get reply by ID
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     responses:
 *       200:
 *         description: Reply retrieved successfully
 *       404:
 *         description: Reply not found
 */
router.get('/:id', optionalAuth, getReplyById);

/**
 * @swagger
 * /api/replies:
 *   post:
 *     summary: Create a new reply
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post
 *               - content
 *             properties:
 *               post:
 *                 type: string
 *               content:
 *                 type: string
 *               parentReply:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [reply, answer, comment]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Reply created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', protect, createReply);

/**
 * @swagger
 * /api/replies/{id}:
 *   put:
 *     summary: Update a reply
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *       404:
 *         description: Reply not found
 *       403:
 *         description: Not authorized
 */
router.put('/:id', protect, updateReply);

/**
 * @swagger
 * /api/replies/{id}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     responses:
 *       200:
 *         description: Reply deleted successfully
 *       404:
 *         description: Reply not found
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', protect, deleteReply);

/**
 * @swagger
 * /api/replies/{id}/like:
 *   post:
 *     summary: Like or unlike a reply
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     responses:
 *       200:
 *         description: Like toggled
 *       404:
 *         description: Reply not found
 */
router.post('/:id/like', protect, likeReply);

/**
 * @swagger
 * /api/replies/{id}/dislike:
 *   post:
 *     summary: Dislike or undislike a reply
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     responses:
 *       200:
 *         description: Dislike toggled
 *       404:
 *         description: Reply not found
 */
router.post('/:id/dislike', protect, dislikeReply);

/**
 * @swagger
 * /api/replies/{id}/helpful:
 *   post:
 *     summary: Mark reply as helpful
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     responses:
 *       200:
 *         description: Reply marked as helpful
 *       404:
 *         description: Reply not found
 */
router.post('/:id/helpful', protect, markHelpful);

/**
 * @swagger
 * /api/replies/{id}/unhelpful:
 *   post:
 *     summary: Unmark reply as helpful
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     responses:
 *       200:
 *         description: Reply unmarked as helpful
 *       404:
 *         description: Reply not found
 */
router.post('/:id/unhelpful', protect, unmarkHelpful);

module.exports = router; 