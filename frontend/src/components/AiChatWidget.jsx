import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Bot, User, ChevronDown } from 'lucide-react';
import { sendChatMessage, getTeamSummary } from '../api/assistantService';

const AiChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [isOpen]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMsg = { role: 'user', content: trimmed };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput('');
        setIsLoading(true);

        try {
            const { reply } = await sendChatMessage(trimmed, messages);
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            const errorText = err.response?.data?.message || 'Failed to get a response. Please try again.';
            setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errorText}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSummary = async () => {
        if (isLoading) return;
        setIsLoading(true);

        // Add a user-style message to show the action taken
        setMessages(prev => [...prev, { role: 'user', content: '📊 Generate this week\'s team summary' }]);

        try {
            const { reply } = await getTeamSummary();
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            const errorText = err.response?.data?.message || 'Failed to generate summary. Please try again.';
            setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errorText}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Simple markdown-like rendering for assistant messages
    const renderContent = (text) => {
        // Split by lines and handle **bold**, `code`, and ### headings
        return text.split('\n').map((line, i) => {
            // Headings
            if (line.startsWith('### ')) {
                return <h4 key={i} className="text-sm font-bold text-white mt-3 mb-1">{line.slice(4)}</h4>;
            }
            if (line.startsWith('## ')) {
                return <h3 key={i} className="text-sm font-bold text-white mt-3 mb-1">{line.slice(3)}</h3>;
            }
            if (line.startsWith('# ')) {
                return <h3 key={i} className="text-base font-bold text-white mt-3 mb-1">{line.slice(2)}</h3>;
            }

            // Bullet points
            if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                    <div key={i} className="flex gap-2 ml-2 my-0.5">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
                    </div>
                );
            }

            // Numbered lists
            const numMatch = line.match(/^(\d+)\.\s/);
            if (numMatch) {
                return (
                    <div key={i} className="flex gap-2 ml-2 my-0.5">
                        <span className="text-blue-400 font-semibold min-w-[1.2rem]">{numMatch[1]}.</span>
                        <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(numMatch[0].length)) }} />
                    </div>
                );
            }

            // Empty lines
            if (line.trim() === '') return <div key={i} className="h-2" />;

            // Normal text
            return <p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
        });
    };

    // Inline formatting: **bold**, `code`
    const formatInline = (text) => {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
            .replace(/`(.+?)`/g, '<code class="bg-slate-700 text-blue-300 px-1 py-0.5 rounded text-xs">$1</code>');
    };

    return (
        <>
            {/* ── Floating Chat Bubble ─────────────────────────────────── */}
            {!isOpen && (
                <button
                    id="ai-chat-bubble"
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 group"
                    aria-label="Open AI Chat Assistant"
                >
                    <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
                    {/* Pulse indicator */}
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0B1120] animate-pulse" />
                </button>
            )}

            {/* ── Chat Panel ───────────────────────────────────────────── */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl border border-[#1E293B] bg-[#0B1120] shadow-2xl shadow-black/50 overflow-hidden animate-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0F172A] to-[#111827] border-b border-[#1E293B]">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">AI Assistant</h3>
                                <p className="text-[11px] text-slate-400">Team insights &amp; analysis</p>
                            </div>
                        </div>
                        <button
                            id="ai-chat-close"
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white hover:bg-[#1E293B] p-1.5 rounded-lg transition-colors"
                            aria-label="Close chat"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {/* Welcome message if empty */}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center mb-4">
                                    <Sparkles size={28} className="text-blue-400" />
                                </div>
                                <h4 className="text-white font-semibold mb-2">Team Report Assistant</h4>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    Ask me about your team's progress, blockers, workload, or generate a weekly summary.
                                </p>
                                <div className="space-y-2 w-full">
                                    <button
                                        id="ai-chat-quick-summary"
                                        onClick={handleSummary}
                                        disabled={isLoading}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-300 text-sm hover:bg-blue-500/20 transition-colors flex items-center gap-2 justify-center"
                                    >
                                        <Sparkles size={14} />
                                        Summarize this week
                                    </button>
                                    {[
                                        'Who has the most blockers right now?',
                                        'Which team member logged the most hours?',
                                        'Are there any recurring blockers?'
                                    ].map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                                            className="w-full px-4 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-slate-300 text-sm hover:bg-[#172554] hover:border-blue-500/30 transition-colors text-left"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message Bubbles */}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                        <Bot size={14} className="text-white" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-md'
                                            : 'bg-[#111827] text-slate-200 border border-[#1E293B] rounded-bl-md'
                                    }`}
                                >
                                    {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-7 h-7 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                                        <User size={14} className="text-white" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot size={14} className="text-white" />
                                </div>
                                <div className="bg-[#111827] border border-[#1E293B] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                                    <Loader2 size={16} className="text-blue-400 animate-spin" />
                                    <span className="text-slate-400 text-sm">Analyzing team data...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="px-4 py-3 border-t border-[#1E293B] bg-[#0F172A]">
                        {/* Quick summary button (visible when there are messages) */}
                        {messages.length > 0 && (
                            <button
                                id="ai-chat-summary-inline"
                                onClick={handleSummary}
                                disabled={isLoading}
                                className="mb-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-300 text-xs hover:bg-blue-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <Sparkles size={12} />
                                Summarize this week
                            </button>
                        )}
                        <div className="flex items-end gap-2">
                            <textarea
                                id="ai-chat-input"
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your team..."
                                rows={1}
                                className="flex-1 resize-none bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors max-h-24 overflow-y-auto"
                                style={{ minHeight: '42px' }}
                            />
                            <button
                                id="ai-chat-send"
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 transition-colors flex-shrink-0"
                                aria-label="Send message"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 text-center">
                            AI responses are based on team report data only
                        </p>
                    </div>
                </div>
            )}

            {/* Panel open/close animation styles */}
            <style>{`
                .animate-in {
                    animation: chatSlideIn 0.3s ease-out;
                }
                @keyframes chatSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </>
    );
};

export default AiChatWidget;
