const variants = {
  primary: "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-[#667eea]/30 active:scale-[0.98]",
  secondary: "bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10",
  ghost: "text-white/40 hover:text-white/70",
  danger: "bg-red-500/10 border border-red-500/30 text-red-300 font-semibold hover:bg-red-500/20 active:scale-[0.98]",
  accent: "text-[#667eea] border border-[#667eea]/30 font-medium hover:bg-[#667eea]/10 active:scale-[0.98]",
  success: "bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30 font-medium hover:bg-[#34d399]/25",
  error: "bg-red-500/10 text-red-300 border border-red-500/30 font-medium hover:bg-red-500/20",
  glow: "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white font-semibold animate-pulse-soft hover:opacity-90",
};

export default function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  const base = "py-3 px-4 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm";
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variantsMap = {
    default: "bg-white/10 text-white/40",
    success: "bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30",
    accent: "bg-[#667eea]/15 text-[#667eea] border border-[#667eea]/30",
    danger: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${variantsMap[variant]} ${className}`}>
      {children}
    </span>
  );
}