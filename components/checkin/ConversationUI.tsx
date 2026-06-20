'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { AIMessage, UserMessage, ScrollAnchor } from './Message';
import type { ChatMessage } from '@/hooks/useCheckIn';

// Quick reply chips shown contextually
const QUICK_REPLIES: Record<number, string[]> = {
    0: ['Pretty good', 'Not great', 'Terrible honestly', 'It varies'],
    1: ['Full of energy', 'Running on empty', 'Somewhere in between'],
    2: ['Work pressure', 'Relationships', 'Just everything', 'Nothing specific'],
    3: ['Very connected', 'A bit isolated', 'Pretty lonely lately'],
    4: ['Yes, a few things', 'Struggling to think of any', 'One small thing'],
    5: ['Financial stress', 'Health worries', 'Uncertainty about the future', 'Self-doubt'],
    6: ['Exercise or walks', 'Talking to someone', 'Scrolling my phone', 'Nothing really works'],
    7: ['Feel less anxious', 'Sleep better', 'Have more energy', 'Just get through it'],
};

interface Props {
    messages: ChatMessage[];
    isStreaming: boolean;
    isComplete: boolean;
    questionNumber: number;
    onSend: (text: string) => Promise<void>;
}

export function ConversationUI({
    messages,
    isStreaming,
    isComplete,
    questionNumber,
    onSend,
}: Props) {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const chips = QUICK_REPLIES[questionNumber] ?? [];

    // Auto-focus input when not streaming
    useEffect(() => {
        if (!isStreaming && !isComplete) {
            inputRef.current?.focus();
        }
    }, [isStreaming, isComplete]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isStreaming || isComplete) return;
        setInput('');
        await onSend(text);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChip = async (chip: string) => {
        if (isStreaming || isComplete) return;
        await onSend(chip);
    };

    // Auto-resize textarea
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Progress indicator */}
            {questionNumber > 0 && !isComplete && (
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                    <div className="flex gap-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${i < questionNumber
                                        ? 'bg-teal-500 w-6'
                                        : 'bg-gray-200 w-3'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-400 ml-1">
                        Question {questionNumber} of 8
                    </span>
                </div>
            )}

            {/* Completion banner */}
            {isComplete && (
                <div className="mx-4 mt-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                    <p className="text-sm text-teal-700 font-medium text-center">
                        ✨ Check-in complete — taking you to your results...
                    </p>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((msg) =>
                    msg.role === 'assistant' ? (
                        <AIMessage key={msg.id} message={msg} />
                    ) : (
                        <UserMessage key={msg.id} message={msg} />
                    )
                )}
                <ScrollAnchor />
            </div>

            {/* Quick reply chips */}
            {chips.length > 0 && !isStreaming && !isComplete && messages.length > 0 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                        <button
                            key={chip}
                            onClick={() => handleChip(chip)}
                            className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-full px-3 py-1.5 transition-colors"
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            )}

            {/* Input area */}
            {!isComplete && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white">
                    <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-100 transition-all">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            placeholder={isStreaming ? 'Mia is typing...' : 'Type your reply...'}
                            disabled={isStreaming || isComplete}
                            rows={1}
                            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none leading-relaxed disabled:opacity-50 max-h-[120px]"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isStreaming || isComplete}
                            className="w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors mb-0.5"
                        >
                            <Send className="w-3.5 h-3.5 text-white disabled:text-gray-400" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                        Press Enter to send · Shift+Enter for new line
                    </p>
                </div>
            )}
        </div>
    );
}