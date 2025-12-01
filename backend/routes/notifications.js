const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const Committee = require('../models/Committee');
const User = require('../models/User');
const { authenticate, requireCommitteeChairOrPermission } = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /notifications
 * @desc  Create a generic notification (messages, comments, etc.)
 * @access Private
 */
router.post('/notifications', authenticate, [
  body('type').optional().isString(),
  body('targetType').optional().isString(),
  body('targetId').optional().isString(),
  body('committeeId').optional().isString(),
  body('message').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const note = await Notification.create({
      type: req.body.type || 'message',
      committeeId: req.body.committeeId || null,
      committeeTitle: req.body.committeeTitle || null,
      requesterId: user._id,
      requesterName: user.name,
      message: req.body.message || null,
      targetType: req.body.targetType || null,
      targetId: req.body.targetId || null,
      metadata: req.body.metadata || null,
      status: req.body.status || 'seen'
    });

    res.status(201).json({ success: true, notification: note });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: 'Server error creating notification' });
  }
});

/**
 * @route GET /notifications/target
 * @desc  Get notifications for a specific target (e.g., motion comments)
 * @access Private
 */
router.get('/notifications/target', authenticate, async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) return res.status(400).json({ success: false, message: 'targetType and targetId are required' });

    // Only return message notifications for this target
    const filter = { targetType: targetType, targetId: { $exists: true } };
    // Attempt to match ObjectId if possible
    try { filter.targetId = new (require('mongodb').ObjectId)(targetId); } catch (e) { filter.targetId = targetId; }

    const items = await Notification.find(filter, { sort: { createdAt: 1 } });
    res.json({ success: true, notifications: items });
  } catch (error) {
    console.error('Get target notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching notifications for target' });
  }
});

/**
 * @route POST /committee/:id/request-access
 * @desc  Request access to a committee (creates a notification addressed to chair/owner)
 * @access Private
 */
router.post('/committee/:id/request-access',
  authenticate,
  [ body('message').optional().isString().trim() ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const committee = await Committee.findByIdOrSlug(req.params.id);
      if (!committee) return res.status(404).json({ success: false, message: 'Committee not found' });

      const requesterId = req.user.userId;
      const requester = await User.findById(requesterId);

      // Prevent duplicate pending requests from same user
      const existing = await Notification.collection().findOne({
        type: 'access_request',
        committeeId: committee._id,
        requesterId: requester._id,
        status: 'pending'
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Access request already pending' });
      }

      const note = await Notification.create({
        type: 'access_request',
        committeeId: committee._id,
        committeeTitle: committee.title,
        requesterId: requester._id,
        requesterName: requester.name,
        message: req.body.message || null,
        status: 'pending'
      });

      // Optionally: you could trigger real-time notification here (websocket/email)

      res.status(201).json({ success: true, message: 'Access request created', notification: note });
    } catch (error) {
      console.error('Request access error:', error);
      res.status(500).json({ success: false, message: 'Server error creating access request' });
    }
  }
);

/**
 * @route GET /notifications
 * @desc  Get notifications relevant to the current user (chairs see committee requests, requesters see their requests)
 * @access Private
 */
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isAdmin = user.roles && user.roles.includes('admin');

    // Find committees where user is chair or owner
    const chaired = await Committee.collection().find({ $or: [{ chair: user._id }, { owner: user._id }] }).project({ _id: 1 }).toArray();
    const chairedIds = chaired.map(c => c._id);

    const filter = {
      $or: [ { requesterId: user._id } ]
    };

    if (isAdmin) {
      // Admin sees all
      delete filter.$or;
    } else {
      // Chairs/owners see requests for their committees
      filter.$or.push({ committeeId: { $in: chairedIds } });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await Notification.collection().countDocuments(filter);
    const items = await Notification.collection().find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray();

    // Filter out notifications that are expired according to rules:
    // - access_request (approval) notifications: if handled (status != 'pending'), hide after 30 minutes from handledAt
    // - non-approval notifications: hide 30 minutes after being seen (seenAt) or handled (handledAt)
    const now = new Date();
    const threshold = new Date(now.getTime() - 30 * 60 * 1000);
    const filtered = items.filter(item => {
      const isApproval = item.type === 'access_request';
      if (item.status === 'pending') return true;

      // handledAt may be null; seenAt may be null
      if (isApproval) {
        // show only if handledAt within last 30 minutes
        if (item.handledAt && new Date(item.handledAt) >= threshold) return true;
        return false;
      } else {
        // non-approval: show if seenAt within last 30 minutes OR handledAt within last 30 minutes
        if (item.seenAt && new Date(item.seenAt) >= threshold) return true;
        if (item.handledAt && new Date(item.handledAt) >= threshold) return true;
        return false;
      }
    });

    res.json({ success: true, notifications: filtered, page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length/limit) });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching notifications' });
  }
});

/**
 * @route PUT /notifications/:id
 * @desc  Handle a notification: approve or deny (only chair/owner or admin)
 * @access Private
 */
router.put('/notifications/:id', authenticate, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'deny'
    if (!action || !['approve','deny'].includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' });

    const note = await Notification.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Notification not found' });

    // Ensure the authenticated user is allowed to act: admin OR committee chair/owner
    const user = await User.findById(req.user.userId);
    const isAdmin = user.roles && user.roles.includes('admin');
    let allowed = false;
    if (isAdmin) allowed = true;
    else {
      const committee = await Committee.findById(note.committeeId);
      if (committee) {
        const role = await Committee.getMemberRole(committee._id, req.user.userId);
        if (role === 'chair' || role === 'owner') allowed = true;
      }
    }

    if (!allowed) return res.status(403).json({ success: false, message: 'Not authorized to handle this notification' });

    if (action === 'approve') {
      // Add requester as member (idempotent)
      try {
        await Committee.addMemberWithRole(note.committeeId, note.requesterId, 'guest');
        await User.addMemberCommittee(note.requesterId, note.committeeId);
        try {
          await User.addGuestCommittee(note.requesterId, note.committeeId);
        } catch (e) { console.warn('Failed to mark user as guest committee member:', e); }
      } catch (e) {
        console.warn('Failed to add member during approval:', e);
      }

      const updated = await Notification.updateById(note._id, { status: 'approved', handledBy: req.user.userId, handledAt: new Date() });
      return res.json({ success: true, message: 'Request approved', notification: updated });
    }

    if (action === 'deny') {
      const updated = await Notification.updateById(note._id, { status: 'denied', handledBy: req.user.userId, handledAt: new Date() });
      return res.json({ success: true, message: 'Request denied', notification: updated });
    }

      // mark_seen action handled below
      if (action === 'mark_seen') {
        // Only allow marking as seen for notifications the user can view
        try {
          const allowedToMark = (note.requesterId && note.requesterId.toString() === req.user.userId) || isAdmin || false;
          // Chairs/owners should also be able to mark items for their committees
          if (!allowedToMark) {
            const committee = note.committeeId ? await Committee.findById(note.committeeId) : null;
            if (committee && (committee.chair && committee.chair.toString() === req.user.userId || committee.owner && committee.owner.toString() === req.user.userId)) {
              // allowed
            } else {
              return res.status(403).json({ success: false, message: 'Not authorized to mark this notification seen' });
            }
          }
          const updated = await Notification.updateById(note._id, { seenAt: new Date() });
          return res.json({ success: true, message: 'Notification marked seen', notification: updated });
        } catch (e) {
          console.error('Mark seen error', e);
          return res.status(500).json({ success: false, message: 'Error marking notification seen' });
        }
      }

      res.status(400).json({ success: false, message: 'Unhandled action' });
  } catch (error) {
    console.error('Handle notification error:', error);
    res.status(500).json({ success: false, message: 'Server error handling notification' });
  }
});

module.exports = router;
