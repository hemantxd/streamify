import User from '../models/User.js';

const LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'hi'];

const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  hi: 'Hindi',
};

const LANGUAGE_FLAGS = {
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  pt: '🇵🇹',
  ja: '🇯🇵',
  ko: '🇰🇷',
  zh: '🇨🇳',
  hi: '🇮🇳',
};

export async function getCommunities(req, res) {
  try {
    const user = req.user;
    const communities = LANGUAGES.map((code) => {
      const nativeCount = 0; // will be filled below
      const learningCount = 0;
      return {
        code,
        name: LANGUAGE_NAMES[code],
        flag: LANGUAGE_FLAGS[code],
        nativeCount,
        learningCount,
        userIsNative: user.nativeLanguage === code,
        userIsLearning: user.learningLanguage === code,
      };
    });

    // Get counts for each language
    const counts = await User.aggregate([
      { $match: { isOnboarded: true } },
      {
        $group: {
          _id: null,
          nativeCounts: { $push: '$nativeLanguage' },
          learningCounts: { $push: '$learningLanguage' },
        },
      },
    ]);

    if (counts.length > 0) {
      const nativeFreq = {};
      const learningFreq = {};
      counts[0].nativeCounts.forEach((l) => { if (l) nativeFreq[l] = (nativeFreq[l] || 0) + 1; });
      counts[0].learningCounts.forEach((l) => { if (l) learningFreq[l] = (learningFreq[l] || 0) + 1; });

      communities.forEach((c) => {
        c.nativeCount = nativeFreq[c.code] || 0;
        c.learningCount = learningFreq[c.code] || 0;
      });
    }

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
      isOnboarded: true,
      $or: [{ nativeLanguage: language }, { learningLanguage: language }],
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