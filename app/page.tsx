export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-center page-container py-20 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse-soft" />
          MindBridge is being built
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-stone-800 mb-6 text-balance">
          Find the right support{' '}
          <span className="gradient-text">for your mind</span>
        </h1>
        <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-10 text-balance">
          A 5-minute check-in that matches you with the right therapist,
          resource, or community. No jargon. No judgment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/auth/signup" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
            Start your free check-in
            <span aria-hidden>→</span>
          </a>
          <a href="/auth/login" className="btn-secondary text-base px-8 py-3">
            Sign in
          </a>
        </div>
        <p className="text-sm text-stone-400 mt-6">
          Free to start · No credit card required · Built for India
        </p>
      </div>
    </main>
  )
}
