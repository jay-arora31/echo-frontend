

interface SummaryLoaderProps {
    isVisible: boolean;
}

export function SummaryLoader({ isVisible }: SummaryLoaderProps) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col items-center gap-6 animate-scale-in">
                {/* Google-style spinner */}
                <div className="relative">
                    {/* Outer ring */}
                    <div className="w-16 h-16 rounded-full border-4 border-gray-100" />
                    {/* Spinning arc */}
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#4285F4] border-r-[#EA4335] animate-spin-slow" />
                </div>

                {/* Text */}
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-medium text-gray-800 animate-pulse-subtle">
                        Generating your summary...
                    </h2>
                    <p className="text-sm text-gray-500">
                        Our AI is analyzing your conversation
                    </p>
                </div>

                {/* Dots animation */}
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#4285F4] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#EA4335] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#FBBC04] animate-bounce" style={{ animationDelay: '300ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#34A853] animate-bounce" style={{ animationDelay: '450ms' }} />
                </div>
            </div>
        </div>
    );
}
