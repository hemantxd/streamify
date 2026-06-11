import Notification from '../models/Notification.js';

export async function getNotifications(req, res) {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
      .populate('from', 'fullName profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('getNotifications error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error('markNotificationRead error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllRead error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}