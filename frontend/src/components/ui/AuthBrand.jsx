export default function AuthBrand({ subtitle }) {
  return (
    <div className="hidden md:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/5 relative overflow-hidden">
      <div className="absolute w-80 h-80 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full blur-[80px] opacity-20 -top-20 -left-20 pointer-events-none" />
      <div className="text-center relative z-10">
        <div className="text-7xl mb-4 animate-bounce">🎧</div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2">Streamify</h1>
        <p className="text-white/60 text-base max-w-[280px] mx-auto leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}