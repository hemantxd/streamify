export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center min-h-[60vh] ${className}`}>
      <div className="w-10 h-10 border-[3px] border-white/10 border-t-[#667eea] rounded-full animate-spin" />
    </div>
  );
}