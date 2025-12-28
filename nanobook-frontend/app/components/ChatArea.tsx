import React from 'react';
import { Message, Role } from '../Utils/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatAreaProps {
    messages: Message[];
    inputValue: string;
    isTyping: boolean;
    onInputChange: (value: string) => void;
    onSendMessage: () => void;
    onUploadClick: () => void;
    onToggleSidebar: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
    messages,
    inputValue,
    isTyping,
    onInputChange,
    onSendMessage,
    onUploadClick,
    onToggleSidebar,
}) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                192
            )}px`;
        }
    }, [inputValue]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative">
            <div className="h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10 sticky top-0">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 -ml-2 text-slate-500 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px] md:max-w-none">
                            Research Session
                        </span>
                    </div>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4">
                        <h2 className="text-2xl md:text-3xl font-serif text-slate-800 dark:text-white mb-4">
                            Good Afternoon, Researcher.
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed mb-8">
                            NanoBook synthesizes your sources into clear,
                            actionable insights.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
                            {[
                                'Summarize key findings',
                                'Find contradictions',
                                'Identify main thesis',
                                'Extract figures',
                            ].map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onInputChange(suggestion)}
                                    className="p-3 md:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left text-sm text-slate-600 dark:text-slate-300 hover:border-blue-400 transition-colors shadow-sm"
                                >
                                    "{suggestion}"
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto w-full space-y-8 pb-32">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${
                                    msg.role === Role.USER
                                        ? 'justify-end'
                                        : 'justify-start'
                                }`}
                            >
                                <div
                                    className={`
                  max-w-[95%] md:max-w-[85%] rounded-2xl p-4 md:p-5 shadow-sm
                  ${
                      msg.role === Role.USER
                          ? 'bg-electric-blue text-white rounded-tr-none'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-tl-none serif-text text-base md:text-[17px] leading-relaxed'
                  }
                `}
                                >
                                    <div className="markdown-content whitespace-pre-wrap">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 md:p-5 shadow-sm">
                                    <div className="flex space-x-1.5">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4 md:p-8 absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
                <div className="max-w-3xl mx-auto w-full pointer-events-auto">
                    <div className="relative group">
                        <div className="relative flex items-end bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 md:p-2 pr-3 md:pr-4 shadow-xl ring-1 ring-black/5 focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-colors">
                            <button
                                onClick={onUploadClick}
                                className="p-2 md:p-3 text-slate-400 hover:text-blue-500 transition-colors self-end mb-1"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                    />
                                </svg>
                            </button>
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => onInputChange(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Analyze documents..."
                                rows={1}
                                className="flex-1 bg-transparent border-none text-slate-800 dark:text-slate-100 py-2 md:py-3 px-2 md:px-4 max-h-48 overflow-y-auto resize-none scrollbar-hide text-base focus:outline-none"
                                style={{ height: 'auto', minHeight: '44px' }}
                            />
                            <button
                                onClick={onSendMessage}
                                disabled={!inputValue.trim() || isTyping}
                                className={`p-2 md:p-3 rounded-xl transition-all mb-1 shrink-0 ${
                                    !inputValue.trim() || isTyping
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        : 'bg-electric-blue text-white shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95'
                                }`}
                            >
                                <svg
                                    className="w-5 h-5 transform rotate-90"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
