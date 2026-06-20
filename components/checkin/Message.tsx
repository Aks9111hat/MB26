'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/hooks/useCheckIn';

// Mia avatar
function MiaAvatar() {
    return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">M</span>
        </div>
    );
}

// Typing indicator dots
function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-1 py-1">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
                />
            ))}
        </div>
    );
}

export function AIMessage({ message }: { message: ChatMessage }) {
    const isTyping = message.isStreaming && message.content === '';

    if (message.isSafety) {
        return (
            <div className="flex gap-3 items-start">
                <MiaAvatar />
                <div className="max-w-[85%] sm:max-w-[75%]">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        <p className="text-sm font-medium text-amber-800 mb-2">
                            💛 You shared something important
                        </p>
                        <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                            {message.content}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-3 items-start">
            <MiaAvatar />
            <div className="max-w-[85%] sm:max-w-[75%]">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    {isTyping ? (
                        <TypingDots />
                    ) : (
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {message.content}
                            {message.isStreaming && (
                                <span className="inline-block w-0.5 h-4 bg-teal-500 ml-0.5 animate-pulse align-middle" />
                            )}
                        </p>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-1">Mia</p>
            </div>
        </div>
    );
}

export function UserMessage({ message }: { message: ChatMessage }) {
    return (
        <div className="flex justify-end">
            <div className="max-w-[85%] sm:max-w-[75%]">
                <div className="bg-teal-500 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                    <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                        {message.content}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Auto-scroll anchor
export function ScrollAnchor() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return <div ref={ref} />;
}