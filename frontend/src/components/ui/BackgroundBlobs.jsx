export default function BackgroundBlobs({ variant = 'auth' }) {
  if (variant === 'auth') {
    return (
      <>
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full blur-[120px] opacity-15 -top-40 -right-40 animate-float pointer-events-none" />
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#f093fb] to-[#f5576c] rounded-full blur-[100px] opacity-10 -bottom-20 -left-20 animate-float-reverse pointer-events-none" />
      </>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full blur-[100px] opacity-15 -top-40 -left-20 animate-float" />
      <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#f093fb] to-[#f5576c] rounded-full blur-[100px] opacity-15 -bottom-20 -right-20 animate-float-reverse" />
      <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-full blur-[100px] opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-slow" />
    </div>
  );
}