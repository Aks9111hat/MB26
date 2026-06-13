import { cn } from '@/lib/utils'

// Spinner
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin h-5 w-5 text-teal-500', className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// Full page loading
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
          <span className="text-white text-xl">🌿</span>
        </div>
        <p className="text-stone-400 text-sm font-medium">Loading MindBridge…</p>
      </div>
    </div>
  )
}

// Skeleton block
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-stone-200 rounded-lg',
        className
      )}
    />
  )
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="card space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-8 w-1/4 mt-4" />
    </div>
  )
}

// Therapist card skeleton
export function TherapistCardSkeleton() {
  return (
    <div className="card space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}

// Typing indicator for chat
export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
        <span className="text-sm">🤍</span>
      </div>
      <div className="bubble-ai flex items-center gap-1 py-4 px-5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}
