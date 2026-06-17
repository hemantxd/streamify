import mongoose from 'mongoose';

const communityMessageSchema = new mongoose.Schema(
  {
    community: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

communityMessageSchema.index({ community: 1, createdAt: -1 });

const CommunityMessage = mongoose.model('CommunityMessage', communityMessageSchema);
export default CommunityMessage;