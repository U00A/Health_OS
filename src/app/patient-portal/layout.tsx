export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-white">
      <header className="h-16 bg-white border-b flex items-center px-6 font-semibold text-gray-800 shadow-sm">
        My Health Portal
      </header>
      <main className="flex-1 p-4 md:p-8 overflow-auto max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
