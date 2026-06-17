import User from '../models/User.js';
import CommunityMessage from '../models/CommunityMessage.js';
import { emitCommunityMessage } from '../lib/socket.js';

const LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'hi'];

const LANGUAGE_NAMES = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  it: 'Italian', pt: 'Portuguese', ja: 'Japanese', ko: 'Korean',
  zh: 'Chinese', hi: 'Hindi',
};

const LANGUAGE_FLAGS = {
  en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪',
  it: '🇮🇹', pt: '🇵🇹', ja: '🇯🇵', ko: '🇰🇷',
  zh: '🇨🇳', hi: '🇮🇳',
};

export async function getCommunities(req, res) {
  try {
    const user = req.user;
    const communities = await Promise.all(LANGUAGES.map(async (code) => {
      const memberCount = await User.countDocuments({
        joinedCommunities: code,
        isOnboarded: true,
      });

      const lastMessage = await CommunityMessage.findOne({ community: code })
        .sort({ createdAt: -1 })
        .populate('sender', 'fullName');

      return {
        code,
        name: LANGUAGE_NAMES[code],
        flag: LANGUAGE_FLAGS[code],
        memberCount,
        userIsJoined: user.joinedCommunities.includes(code),
        userIsNative: user.nativeLanguage === code,
        userIsLearning: user.learningLanguage === code,
        lastMessage: lastMessage
          ? { text: lastMessage.text, senderName: lastMessage.sender?.fullName || 'Unknown', createdAt: lastMessage.createdAt }
          : null,
      };
    }));

    res.status(200).json({ success: true, communities });
  } catch (error) {
    console.error('getCommunities error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getCommunityMembers(req, res) {
  try {
    const { language } = req.params;
    if (!LANGUAGES.includes(language)) {
      return res.status(400).json({ message: 'Invalid language code' });
    }

    const members = await User.find({
      joinedCommunities: language,
      isOnboarded: true,
    })
      .select('fullName email profilePicture nativeLanguage learningLanguage bio location')
      .lean();

    const enriched = members.map((m) => ({
      ...m,
      relation: m.nativeLanguage === language ? 'native' : 'learning',
    }));

    res.status(200).json({ success: true, members: enriched });
  } catch (error) {
    console.error('getCommunityMembers error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function joinCommunity(req, res) {
  try {
    const userId = req.user._id;
    const { language } = req.body;

    if (!LANGUAGES.includes(language)) {
      return res.status(400).json({ message: 'Invalid language code' });
    }

    const user = await User.findById(userId);
    if (user.joinedCommunities.includes(language)) {
      return res.status(400).json({ message: 'Already joined this community' });
    }

    user.joinedCommunities.push(language);
    await user.save();

    // Exclude password from response
    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({ success: true, message: `Joined ${LANGUAGE_NAMES[language]} community`, user: updatedUser });
  } catch (error) {
    console.error('joinCommunity error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function leaveCommunity(req, res) {
  try {
    const userId = req.user._id;
    const { language } = req.body;

    if (!LANGUAGES.includes(language)) {
      return res.status(400).json({ message: 'Invalid language code' });
    }

    const user = await User.findById(userId);
    if (!user.joinedCommunities.includes(language)) {
      return res.status(400).json({ message: 'Not a member of this community' });
    }

    user.joinedCommunities = user.joinedCommunities.filter((c) => c !== language);
    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({ success: true, message: `Left ${LANGUAGE_NAMES[language]} community`, user: updatedUser });
  } catch (error) {
    console.error('leaveCommunity error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getCommunityMessages(req, res) {
  try {
    const { language } = req.params;
    const { limit = 50, before } = req.query;

    if (!LANGUAGES.includes(language)) {
      return res.status(400).json({ message: 'Invalid language code' });
    }

    // Verify user has joined
    if (!req.user.joinedCommunities.includes(language)) {
      return res.status(403).json({ message: 'You must join this community to view messages' });
    }

    const filter = { community: language };
    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const messages = await CommunityMessage.find(filter)
      .populate('sender', 'fullName profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error('getCommunityMessages error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function sendCommunityMessage(req, res) {
  try {
    const userId = req.user._id;
    const { language, text } = req.body;

    if (!LANGUAGES.includes(language)) {
      return res.status(400).json({ message: 'Invalid language code' });
    }

    if (!req.user.joinedCommunities.includes(language)) {
      return res.status(403).json({ message: 'You must join this community to send messages' });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const message = await CommunityMessage.create({
      community: language,
      sender: userId,
      text,
    });

    const populated = await CommunityMessage.findById(message._id)
      .populate('sender', 'fullName profilePicture');

    // Real-time broadcast
    emitCommunityMessage(populated);

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    console.error('sendCommunityMessage error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}