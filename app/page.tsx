// export default function Home() {
//   return (
//     <main className="min-h-screen flex items-center justify-center bg-gradient-hero">
//       <div className="text-center page-container py-20 animate-fade-up">
//         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-8">
//           <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse-soft" />
//           MindBridge is being built
//         </div>
//         <h1 className="font-display text-5xl md:text-6xl font-bold text-stone-800 mb-6 text-balance">
//           Find the right support{' '}
//           <span className="gradient-text">for your mind</span>
//         </h1>
//         <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-10 text-balance">
//           A 5-minute check-in that matches you with the right therapist,
//           resource, or community. No jargon. No judgment.
//         </p>
//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <a href="/auth/signup" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
//             Start your free check-in
//             <span aria-hidden>→</span>
//           </a>
//           <a href="/auth/login" className="btn-secondary text-base px-8 py-3">
//             Sign in
//           </a>
//         </div>
//         <p className="text-sm text-stone-400 mt-6">
//           Free to start · No credit card required · Built for India
//         </p>
//       </div>
//     </main>
//   )
// }

import Link from 'next/link';

function HeroIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
      <circle cx="200" cy="150" r="120" fill="#ccfbf1" opacity="0.5" />
      <circle cx="200" cy="150" r="85" fill="#99f6e4" opacity="0.6" />
      {/* Bridge shape */}
      <path
        d="M 80 180 Q 200 100 320 180"
        stroke="#0d9488"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="80" cy="180" r="14" fill="#14b8a6" />
      <circle cx="320" cy="180" r="14" fill="#0d9488" />
      <circle cx="200" cy="130" r="18" fill="#fff" stroke="#0d9488" strokeWidth="4" />
      {/* Heart in middle */}
      <path
        d="M200 138 c-3-4-9-4-12 0 c-3 4 0 8 12 14 c12-6 15-10 12-14 c-3-4-9-4-12 0 z"
        fill="#14b8a6"
      />
      {/* Sparkles */}
      <g fill="#5eead4">
        <circle cx="130" cy="90" r="3" />
        <circle cx="280" cy="100" r="4" />
        <circle cx="100" cy="220" r="3" />
        <circle cx="310" cy="230" r="3" />
      </g>
    </svg>
  );
}

function StepIcon({ step }: { step: 1 | 2 | 3 }) {
  const icons = {
    1: (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <rect x="8" y="6" width="32" height="36" rx="4" fill="#ccfbf1" />
        <circle cx="24" cy="20" r="6" fill="#14b8a6" />
        <path d="M14 36 Q24 28 34 36" stroke="#14b8a6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
    2: (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <circle cx="16" cy="24" r="8" fill="#ccfbf1" />
        <circle cx="32" cy="24" r="8" fill="#5eead4" />
        <path d="M22 24 L26 24" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 18 L24 30 M21 21 L27 27 M27 21 L21 27" stroke="#0d9488" strokeWidth="1.5" opacity="0.5" />
      </svg>
    ),
    3: (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <rect x="10" y="10" width="28" height="28" rx="6" fill="#ccfbf1" />
        <path d="M18 24 L22 28 L30 18" stroke="#0d9488" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return icons[step];
}

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50/60 to-white px-4 pt-16 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Find the right support<br />for your mind
          </h1>
          <p className="text-lg text-gray-500 mt-5 max-w-xl mx-auto leading-relaxed">
            A 5-minute check-in that matches you with the right therapist,
            resource, or community. No jargon. No judgment.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block mt-8 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-2xl px-8 py-4 transition-colors shadow-sm hover:shadow-md"
          >
            Start your free check-in
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Free forever · No credit card required
          </p>

          <div className="mt-12">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            How it works
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Three simple steps to feeling supported
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: 1 as const,
                title: 'Check in',
                desc: 'Chat with Mia, our AI companion, for 5 minutes about how you\'re really doing.',
              },
              {
                step: 2 as const,
                title: 'Get matched',
                desc: 'We match you with the right therapist, app, or community — based on you.',
              },
              {
                step: 3 as const,
                title: 'Book support',
                desc: 'Book a session or start exploring resources, all in one place.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <StepIcon step={step} />
                </div>
                <p className="text-xs font-semibold text-teal-500 mb-1">STEP {step}</p>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Built for how you actually feel
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { emoji: '🤝', title: 'Not a diagnosis', desc: 'Mia listens and guides — she never labels or diagnoses you.' },
              { emoji: '🔒', title: 'Private by design', desc: 'Your check-ins are encrypted and never shared without consent.' },
              { emoji: '🇮🇳', title: 'Made for India', desc: 'Vetted Indian therapists, local crisis lines, and Hindi support.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <span className="text-2xl">{emoji}</span>
                <p className="font-semibold text-gray-900 mt-2">{title}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-lg mx-auto text-center bg-teal-500 rounded-3xl p-10">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to check in with yourself?
          </h2>
          <p className="text-teal-100 mb-6">
            It takes 5 minutes and could change how you feel today.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-teal-600 font-semibold rounded-2xl px-8 py-3.5 hover:bg-teal-50 transition-colors"
          >
            Get started — it's free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">© 2026 MindBridge. Made in India.</p>
          <p className="text-xs text-gray-400">
            In crisis? Call iCall: 9152987821 · Vandrevala: 1860-2662-345
          </p>
        </div>
      </footer>
    </div>
  );
}