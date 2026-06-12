import Message from '../models/Message.js';
import User from '../models/User.js';

export async function sendMessage(req, res) {
  try {
    const senderId = req.user._id;
    const { receiverId, text } = req.body;

    if (!receiverId || !text) return res.status(400).json({ message: 'Receiver and text are required' });

    // Verify they are friends
    const user = await User.findById(senderId);
    if (!user.friends.includes(receiverId)) {
      return res.status(403).json({ message: 'Not friends with this user' });
    }

    const message = await Message.create({ sender: senderId, receiver: receiverId, text });

    const populated = await Message.findById(message._id)
      .populate('sender', 'fullName profilePicture')
      .populate('receiver', 'fullName profilePicture');

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    console.error('sendMessage error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getMessages(req, res) {
  try {
    const userId = req.user._id;
    const { friendId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify they are friends
    const user = await User.findById(userId);
    if (!user.friends.includes(friendId)) {
      return res.status(403).json({ message: 'Not friends with this user' });
    }

    const filter = {
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    };
    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(filter)
      .populate('sender', 'fullName profilePicture')
      .populate('receiver', 'fullName profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error('getMessages error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getConversations(req, res) {
  try {
    const userId = req.user._id;

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const friendIds = messages.map((m) => m._id);
    const friends = await User.find({ _id: { $in: friendIds } })
      .select('fullName profilePicture nativeLanguage learningLanguage')
      .lean();

    const friendMap = {};
    friends.forEach((f) => { friendMap[f._id.toString()] = f; });

    const conversations = messages.map((m) => ({
      friend: friendMap[m._id.toString()] || null,
      lastMessage: m.lastMessage,
      unread: m.unreadCount,
    })).filter((c) => c.friend);

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('getConversations error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}