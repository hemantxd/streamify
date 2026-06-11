export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl ${onClick ? 'hover:bg-white/10 cursor-pointer' : ''} transition-all ${className}`}
    >
      {children}
    </div>
  );
}