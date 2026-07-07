export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #152b47 60%, #0d1e30 100%)" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full border-[40px] border-accent/10" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full border-[30px] border-accent/10" />
      </div>
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}
