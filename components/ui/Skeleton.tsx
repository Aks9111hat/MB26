export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />;
}

export function DashboardSkeleton() {
    return (
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
            </div>
        </div>
    );
}

export function TherapistCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 h-48">
            <div className="flex gap-3">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full mt-4 rounded-xl" />
        </div>
    );
}

export function ResultsSkeleton() {
    return (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
    );
}