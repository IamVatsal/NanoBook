'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { Message, Role, Source, MessageHistoryItem } from './Utils/types';
import {
    sendChatMessage,
    uploadDocument,
    resetSources,
} from './(services)/api';

const STORAGE_KEY_MESSAGES = 'nanobook_messages';
const STORAGE_KEY_SOURCES = 'nanobook_sources';
const STORAGE_KEY_THEME = 'nanobook_theme';

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{
        type: 'success' | 'error';
        msg: string;
    } | null>(null);
    const [mounted, setMounted] = useState(false);

    // Persistence: Load from LocalStorage (client-side only)
    useEffect(() => {
        setMounted(true);

        if (typeof window === 'undefined') return;

        const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
        const savedSources = localStorage.getItem(STORAGE_KEY_SOURCES);
        const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);

        if (savedMessages) setMessages(JSON.parse(savedMessages));
        if (savedSources) setSources(JSON.parse(savedSources));
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
        }
    }, []);

    // Apply dark mode to document
    useEffect(() => {
        if (!mounted) return;

        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem(STORAGE_KEY_THEME, darkMode ? 'dark' : 'light');
    }, [darkMode, mounted]);

    // Persistence: Save to LocalStorage
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    }, [messages, mounted]);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(sources));
    }, [sources, mounted]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const currentQuery = inputValue;
        const userMessage: Message = {
            id: Date.now().toString(),
            role: Role.USER,
            content: currentQuery,
            timestamp: Date.now(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputValue('');
        setIsTyping(true);

        try {
            const chatRequest = {
                user_query: inputValue,
                history: messages.map((msg) => ({
                    role:
                        msg.role === Role.USER
                            ? ('user' as const)
                            : ('model' as const),
                    parts: [msg.content],
                })),
            };

            const response = await sendChatMessage(chatRequest);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.model,
                content: response.response,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.model,
                content:
                    'I encountered an error while processing your request. Please check your connection and try again.',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIsUploading(true);
        setUploadStatus(null);

        const uploadPromises = Array.from(files).map(async (file: File) => {
            try {
                // Upload to backend
                const response = await uploadDocument(file);

                // Add to local sources list
                const newSource: Source = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    content: response.filename || file.name,
                    type: file.type || 'application/octet-stream',
                    size: file.size,
                    uploadDate: Date.now(),
                };

                setSources((prev) => [...prev, newSource]);
                return { success: true, name: file.name };
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                return { success: false, name: file.name };
            }
        });

        const results = await Promise.all(uploadPromises);

        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        if (successCount > 0) {
            setUploadStatus({
                type: 'success',
                msg: `Successfully uploaded ${successCount} file${
                    successCount > 1 ? 's' : ''
                }${failCount > 0 ? `, ${failCount} failed` : ''}`,
            });
        } else {
            setUploadStatus({
                type: 'error',
                msg: `Failed to upload ${failCount} file${
                    failCount > 1 ? 's' : ''
                }`,
            });
        }

        setTimeout(() => setUploadStatus(null), 5000);
        setIsUploading(false);
        e.target.value = '';
    };

    const handleRemoveSource = (id: string) => {
        setSources((prev) => prev.filter((s) => s.id !== id));
    };

    const handleReset = async () => {
        if (
            window.confirm(
                'Are you sure you want to reset this research project?'
            )
        ) {
            try {
                await resetSources();
            } finally {
                setMessages([]);
                setSources([]);
                localStorage.removeItem(STORAGE_KEY_MESSAGES);
                localStorage.removeItem(STORAGE_KEY_SOURCES);
            }
        }
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return null;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200 relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div
                className={`
        fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
            >
                <Sidebar
                    sources={sources}
                    onUpload={handleFileUpload}
                    onRemoveSource={handleRemoveSource}
                    onReset={handleReset}
                    isDarkMode={darkMode}
                    onToggleTheme={() => setDarkMode(!darkMode)}
                    onCloseMobile={() => setIsSidebarOpen(false)}
                />
            </div>

            {/* Upload Status Notification */}
            {uploadStatus && (
                <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-4 duration-300">
                    <div
                        className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border ${
                            uploadStatus.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                        }`}
                    >
                        {uploadStatus.type === 'success' ? (
                            <svg
                                className="w-5 h-5 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        )}
                        <span className="text-sm font-medium">
                            {uploadStatus.msg}
                        </span>
                    </div>
                </div>
            )}

            <ChatArea
                messages={messages}
                inputValue={inputValue}
                isTyping={isTyping || isUploading}
                onInputChange={setInputValue}
                onSendMessage={handleSendMessage}
                onUploadClick={() => {
                    const input = document.querySelector(
                        'input[type="file"]'
                    ) as HTMLInputElement;
                    input?.click();
                }}
                onToggleSidebar={() => setIsSidebarOpen(true)}
            />
        </div>
    );
}
