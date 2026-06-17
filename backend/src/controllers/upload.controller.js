import User from '../models/User.js';

export async function uploadProfilePicture(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = req.file.path;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: imageUrl },
      { new: true }
    ).select('-password');

    res.status(200).json({ success: true, user: updatedUser, url: imageUrl });
  } catch (error) {
    console.error('uploadProfilePicture error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { fullName, bio, location, nativeLanguage, learningLanguage } = req.body;

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (bio !== undefined) updateFields.bio = bio;
    if (location !== undefined) updateFields.location = location;
    if (nativeLanguage !== undefined) updateFields.nativeLanguage = nativeLanguage;
    if (learningLanguage !== undefined) updateFields.learningLanguage = learningLanguage;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true }
    ).select('-password');

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('updateProfile error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}