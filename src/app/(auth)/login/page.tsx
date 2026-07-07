import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
      <div className="mb-7 flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-accent bg-brand shadow-lg">
          <span className="text-2xl font-extrabold tracking-tighter text-accent">RS</span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Retail Store</h1>
          <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest">
            Management System
          </p>
        </div>
      </div>
      <LoginForm />
    </div>
  );
}
