const baseClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#667eea] focus:ring-3 focus:ring-[#667eea]/20 transition-all";

export default function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>}
      <input className={baseClass} {...props} />
    </div>
  );
}

export function Textarea({ label, maxLength, value, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>}
      <textarea className={`${baseClass} resize-vertical min-h-[100px]`} value={value} {...props} />
      {maxLength && <span className="block text-xs text-white/30 mt-1.5">{(value || '').length}/{maxLength}</span>}
    </div>
  );
}

export function IconInput({ icon, label, hint, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>}
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 focus-within:border-[#667eea] focus-within:ring-3 focus-within:ring-[#667eea]/20 transition-all">
        <span className="text-lg">{icon}</span>
        <input className="flex-1 py-3 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none" {...props} />
      </div>
      {hint && <span className="block text-xs text-white/30 mt-1.5">{hint}</span>}
    </div>
  );
}