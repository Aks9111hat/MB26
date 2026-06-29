export default function GlobalLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-3 border-teal-100 border-t-teal-500 animate-spin" />
                <p className="text-sm text-gray-400">Loading...</p>
            </div>
        </div>
    );
}