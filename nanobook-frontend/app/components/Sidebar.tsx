import React from 'react';
import { Source } from '../Utils/types';
import SourceCard from './SourceCard';

interface SidebarProps {
    sources: Source[];
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveSource: (id: string) => void;
    onReset: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    sources,
    onUpload,
    onRemoveSource,
    onReset,
    isDarkMode,
    onToggleTheme,
    onCloseMobile,
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="w-80 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl lg:shadow-none">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-electric-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M13.5,0.67l-2.43,2.43c-0.2,0.2-0.2,0.51,0,0.71l0.35,0.35c0.2,0.2,0.51,0.2,0.71,0l1.24-1.24V14.5c0,0.28,0.22,0.5,0.5,0.5s0.5-0.22,0.5-0.5V2.91l1.24,1.24c0.2,0.2,0.51,0.2,0.71,0l0.35-0.35c0.2-0.2,0.2-0.51,0-0.71L14.21,0.67C14.01,0.47,13.7,0.47,13.5,0.67z M18.5,13.5h-1c-0.28,0-0.5,0.22-0.5,0.5v2c0,1.1-0.9,2-2,2H5c-1.1,0-2-0.9-2-2v-2c0-0.28-0.22-0.5-0.5-0.5h-1c-0.28,0-0.5,0.22-0.5,0.5v2c0,2.21,1.79,4,4,4h10c2.21,0,4-1.79,4-4v-2C19,13.72,18.78,13.5,18.5,13.5z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                            NanoBook
                        </h1>
                    </div>
                    <button
                        onClick={onCloseMobile}
                        className="p-2 text-slate-400 hover:text-slate-600 lg:hidden"
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-2 bg-electric-blue hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md active:scale-95"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    <span>Add Source</span>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onUpload}
                    className="hidden"
                    multiple
                    accept=".txt,.md,.pdf,.docx,.doc,.csv"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        Your Sources
                    </h2>
                    <span className="text-xs font-medium text-slate-500">
                        {sources.length}
                    </span>
                </div>
                {sources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                            <svg
                                className="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-400 font-medium">
                            No sources added yet
                        </p>
                    </div>
                ) : (
                    sources.map((s) => (
                        <SourceCard
                            key={s.id}
                            source={s}
                            onRemove={onRemoveSource}
                        />
                    ))
                )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <button
                    onClick={onToggleTheme}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <div className="flex items-center space-x-3">
                        {isDarkMode ? (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                />
                            </svg>
                        )}
                        <span>Theme Toggle</span>
                    </div>
                </button>
                <button
                    onClick={onReset}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                    <div className="flex items-center space-x-3">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                        <span>Reset Project</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
