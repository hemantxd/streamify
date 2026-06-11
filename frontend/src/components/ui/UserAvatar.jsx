export default function UserAvatar({ user, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-24 h-24 text-3xl',
  };

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center font-bold text-white ${className}`}>
      {user?.profilePicture ? (
        <img src={user.profilePicture} alt={user?.fullName || ''} className="w-full h-full object-cover" />
      ) : (
        <span>{user?.fullName?.charAt(0) || '?'}</span>
      )}
    </div>
  );
}