import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';
import Notification from '../models/Notification.js';

export async function sendFriendRequest(req, res) {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) return res.status(400).json({ message: 'Receiver ID is required' });
    if (senderId.toString() === receiverId) return res.status(400).json({ message: 'Cannot send request to yourself' });

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: 'User not found' });

    // Check if already friends
    if (req.user.friends.includes(receiverId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check existing request
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existing) {
      if (existing.status === 'pending') return res.status(400).json({ message: 'Friend request already pending' });
      if (existing.status === 'accepted') return res.status(400).json({ message: 'Already friends' });
      // If declined, allow re-sending by updating
      existing.status = 'pending';
      await existing.save();
    } else {
      await FriendRequest.create({ sender: senderId, receiver: receiverId });
    }

    // Create notification
    await Notification.create({
      user: receiverId,
      type: 'friend_request',
      message: `${req.user.fullName} sent you a friend request`,
      from: senderId,
    });

    res.status(200).json({ success: true, message: 'Friend request sent' });
  } catch (error) {
    console.error('sendFriendRequest error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId).populate('sender', 'fullName');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    request.status = 'accepted';
    await request.save();

    const senderId = request.sender._id;

    // Add to both friends lists
    await User.findByIdAndUpdate(userId, { $addToSet: { friends: senderId } });
    await User.findByIdAndUpdate(senderId, { $addToSet: { friends: userId } });

    // Notify sender
    await Notification.create({
      user: senderId,
      type: 'friend_accepted',
      message: `${req.user.fullName} accepted your friend request`,
      from: userId,
      relatedId: request._id,
    });

    // Notify receiver (you're now friends)
    await Notification.create({
      user: userId,
      type: 'friend_accepted',
      message: `You are now friends with ${request.sender.fullName || 'this user'}`,
      from: senderId,
      relatedId: request._id,
    });

    res.status(200).json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    console.error('acceptFriendRequest error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function declineFriendRequest(req, res) {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId).populate('sender', 'fullName');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    request.status = 'declined';
    await request.save();

    await Notification.create({
      user: request.sender._id,
      type: 'friend_request_declined',
      message: `${req.user.fullName} declined your friend request`,
      from: userId,
      relatedId: request._id,
    });

    res.status(200).json({ success: true, message: 'Friend request declined' });
  } catch (error) {
    console.error('declineFriendRequest error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getPendingRequests(req, res) {
  try {
    const userId = req.user._id;
    const requests = await FriendRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'fullName email profilePicture nativeLanguage learningLanguage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('getPendingRequests error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getFriends(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'fullName email profilePicture nativeLanguage learningLanguage bio location');

    res.status(200).json({ success: true, friends: user.friends });
  } catch (error) {
    console.error('getFriends error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function removeFriend(req, res) {
  try {
    const userId = req.user._id;
    const { friendId } = req.params;

    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    res.status(200).json({ success: true, message: 'Friend removed' });
  } catch (error) {
    console.error('removeFriend error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(400).json({ message: 'Query must be at least 2 characters' });

    const users = await User.find({
      _id: { $ne: req.user._id },
      isOnboarded: true,
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('fullName email profilePicture nativeLanguage learningLanguage bio location')
      .limit(20);

    // Check friend status for each
    const enriched = await Promise.all(
      users.map(async (u) => {
        const isFriend = req.user.friends.includes(u._id);
        const pendingReq = await FriendRequest.findOne({
          $or: [
            { sender: req.user._id, receiver: u._id, status: 'pending' },
            { sender: u._id, receiver: req.user._id, status: 'pending' },
          ],
        });
        return {
          ...u.toObject(),
          isFriend,
          requestStatus: pendingReq ? pendingReq.status : null,
          requestSentByMe: pendingReq ? pendingReq.sender.toString() === req.user._id.toString() : false,
        };
      })
    );

    res.status(200).json({ success: true, users: enriched });
  } catch (error) {
    console.error('searchUsers error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}