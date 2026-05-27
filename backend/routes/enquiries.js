const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// @desc    Submit a new customer/guest enquiry
// @route   POST /api/enquiries
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, userId } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please fill in all enquiry fields.' });
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      subject,
      message,
      userId: userId || null
    });

    res.status(201).json({
      success: true,
      data: enquiry,
      message: 'Your culinary enquiry was submitted successfully. Our concierge team will reach out shortly!'
    });
  } catch (error) {
    console.error('Submit Enquiry Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @desc    Get all enquiries for moderation
// @route   GET /api/enquiries
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const enquiries = await Enquiry.find({})
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (error) {
    console.error('Fetch Enquiries Admin Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update enquiry resolution status
// @route   PUT /api/enquiries/:id/status
// @access  Private (Admin only)
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    enquiry.status = status;
    await enquiry.save();

    res.json({
      success: true,
      data: enquiry,
      message: `Enquiry status updated to '${status}' successfully.`
    });
  } catch (error) {
    console.error('Update Enquiry Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete enquiry record
// @route   DELETE /api/enquiries/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    await Enquiry.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Enquiry record erased successfully.' });
  } catch (error) {
    console.error('Delete Enquiry Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
