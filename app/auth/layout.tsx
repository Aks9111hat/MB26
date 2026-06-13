import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-teal flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-xl">🌿</span>
          </div>
          <span className="text-white font-display font-bold text-xl">MindBridge</span>
        </Link>

        {/* Middle content */}
        <div className="relative z-10">
          <blockquote className="text-white/90 text-2xl font-display font-medium leading-relaxed mb-6">
            &ldquo;Getting support isn&apos;t a sign of weakness. It&apos;s one of the most courageous things you can do.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">🌱</div>
            <div>
              <p className="text-white font-medium text-sm">MindBridge</p>
              <p className="text-white/60 text-sm">Mental wellness navigator</p>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: '5 min', label: 'check-in' },
            { value: 'Free', label: 'to start' },
            { value: '100%', label: 'confidential' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-white font-display font-bold text-2xl">{value}</div>
              <div className="text-white/70 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-stone-50">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden no-underline">
          <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center">
            <span className="text-sm">🌿</span>
          </div>
          <span className="font-display font-bold text-stone-800">MindBridge</span>
        </Link>

        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
