import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { FiMessageSquare, FiPlus, FiSettings, FiSun, FiMoon, FiChevronDown, FiUser, FiLogOut, FiPaperclip, FiArrowDown, FiCopy, FiThumbsUp, FiThumbsDown, FiEdit2, FiMic, FiMicOff } from 'react-icons/fi';
import { PiSparkleFill } from 'react-icons/pi';
import { BsIncognito } from 'react-icons/bs';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { Menu } from '@headlessui/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Add TypeScript interface for SpeechRecognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

enum AuthModalView {
  SIGNIN = 'signin',
  SIGNUP = 'signup'
}

enum MessageSender {
  USER = 'user',
  AI = 'ai'
}

interface Message {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: number;
  files?: UploadedFile[];
}

interface UploadedFile {
  name: string;
  url: string;
  type: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface MessageBubbleProps {
  message: Message;
  setGlobalToast: (msg: string | null) => void;
  globalToastTimeout: React.MutableRefObject<NodeJS.Timeout | null>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, setGlobalToast, globalToastTimeout }) => {
  const isUser = message.sender === MessageSender.USER;

  // Copy to clipboard handler
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setGlobalToast('Copied to clipboard!');
    if (globalToastTimeout.current) clearTimeout(globalToastTimeout.current);
    globalToastTimeout.current = setTimeout(() => setGlobalToast(null), 2000);
  };

  // Like handler
  const handleLike = () => {
    setGlobalToast('Thanks for your upvote!');
    if (globalToastTimeout.current) clearTimeout(globalToastTimeout.current);
    globalToastTimeout.current = setTimeout(() => setGlobalToast(null), 2000);
  };

  // Dislike handler
  const handleDislike = () => {
    setGlobalToast('Downvoted Response!');
    if (globalToastTimeout.current) clearTimeout(globalToastTimeout.current);
    globalToastTimeout.current = setTimeout(() => setGlobalToast(null), 2000);
  };

  useEffect(() => {
    return () => {
      if (globalToastTimeout.current) clearTimeout(globalToastTimeout.current);
    };
  }, [globalToastTimeout]);
  
  return (
    <div className="w-full py-4"> 
      <div className="w-full flex">
        {isUser ? (
          <div className="flex flex-col items-end w-full pr-4">
            <div className="mb-1 max-w-2xl text-base font-medium text-right">
              {message.content}
        </div>
            <div className="text-xs text-gray-400 mt-1 pr-2">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        ) : (
          <div className="flex flex-col items-start w-full pl-4">
            <div className="mb-1 max-w-2xl text-base font-medium text-left">
              {message.content}
            </div>
            {/* Feedback buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="border border-gray-300 rounded-md p-2 hover:bg-gray-100 transition-colors"
                title="Copy"
              >
                <FiCopy />
              </button>
              <button
                type="button"
                onClick={handleLike}
                className="border border-gray-300 rounded-md p-2 hover:bg-gray-100 transition-colors"
                title="Like"
              >
                <FiThumbsUp />
              </button>
              <button
                type="button"
                onClick={handleDislike}
                className="border border-gray-300 rounded-md p-2 hover:bg-gray-100 transition-colors"
                title="Dislike"
              >
                <FiThumbsDown />
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to render AI message content with code blocks
function renderAIContent(content: string, setGlobalToast: (msg: string | null) => void) {
  // Regex to match code blocks: ```lang\ncode\n```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  const elements: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let idx = 0;
  while (true) {
    match = codeBlockRegex.exec(content);
    if (!match) break;
    // Text before code block
    if (match.index > lastIndex) {
      elements.push(
        <span key={`text-${idx}`}>{content.slice(lastIndex, match.index)}</span>
      );
      idx++;
    }
    const lang = match[1] || 'text';
    const code = match[2];
    elements.push(
      <div key={`codeblock-${idx}`} className="my-4 w-full max-w-3xl">
        <div className="flex items-center justify-between px-4 pt-3 pb-1 bg-gray-50 rounded-t-xl border-b border-gray-200">
          <span className="font-semibold text-base">{lang.toUpperCase()} Example</span>
          <button
            type="button"
            className="p-1 rounded hover:bg-gray-200 text-gray-600"
            title="Copy code"
            onClick={() => {
              navigator.clipboard.writeText(code);
              setGlobalToast('Copied code to clipboard!');
            }}
          >
            <FiCopy />
          </button>
        </div>
        <div className="overflow-x-auto rounded-b-xl" style={{ maxWidth: '100%' }}>
          <SyntaxHighlighter language={lang} style={vscDarkPlus} customStyle={{ borderRadius: '0 0 1rem 1rem', margin: 0, fontSize: 15, padding: 20, minWidth: 0 }} showLineNumbers>
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    );
    idx++;
    lastIndex = codeBlockRegex.lastIndex;
  }
  // Remaining text after last code block
  if (lastIndex < content.length) {
    elements.push(
      <span key={`text-${idx}`}>{content.slice(lastIndex)}</span>
    );
  }
  return elements;
}

const App: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'signup' | null>('login');
  const [user, setUser] = useState<User | null>(null);
  const [showGuestMenu, setShowGuestMenu] = useState(false);
  const guestMenuRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Chat State
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = isTemporaryChat ? sessionStorage.getItem('chats') : localStorage.getItem('chats');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((chat: Partial<Chat>, idx: number) => ({
      id: chat.id,
      title: chat.title ?? `Chat ${idx + 1}`,
      messages: chat.messages ?? [],
      createdAt: chat.createdAt ?? Date.now(),
      updatedAt: chat.updatedAt ?? Date.now(),
    }));
  });
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    const saved = isTemporaryChat ? sessionStorage.getItem('currentChatId') : localStorage.getItem('currentChatId');
    return saved || '';
  });
  const currentChat = chats.find(c => c.id === currentChatId) || null;

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Chat Model');
  const [darkMode, setDarkMode] = useState(false);

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Ensure inputMessage and isLoading are defined as state
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Global toast state
  const [globalToast, setGlobalToast] = useState<string | null>(null);
  const globalToastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageValue, setEditingMessageValue] = useState<string>('');

  // Dropdown position state for 3-dots menu
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [dropdownChatId, setDropdownChatId] = useState<string | null>(null);
  const menuButtonRefs = useRef<{ [chatId: string]: HTMLButtonElement | null }>({});

  // Add this ref at the top of the component
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setAuthView(null);
    } else {
      setUser(null);
      setAuthView('login');
    }
  }, []);

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (guestMenuRef.current && !guestMenuRef.current.contains(event.target as Node)) {
      setShowGuestMenu(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Apply dark mode class to body and set theme colors
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--bg-secondary', '#111111');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#9ca3af');
      root.style.setProperty('--border-color', '#1f2937');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f9fafb');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#4b5563');
      root.style.setProperty('--border-color', '#e5e7eb');
    }
  }, [darkMode]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    scrollToBottom();
  }, [currentChatId]);

  const handleNewChat = useCallback(() => {
    const newChat = {
      id: `chat_${Date.now()}`,
      title: "",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
  }, []);

  const handleLoginSuccess = useCallback((user: User) => {
    setUser(user);
    setAuthView(null);
  }, []);

  const handleSignupSuccess = useCallback((user: User) => {
    setUser(user);
    setAuthView(null);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
    setAuthView('login');
  }, []);

  const getAIResponse = useCallback(async (message: string, model: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [{
            role: "user",
            content: message
          }],
          model: model 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return `Sorry, I encountered an error: ${errorData.details || 'Please try again later.'}`;
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Network Error:', error);
      return 'Sorry, I cannot connect to the AI service right now. Please check if the server is running and try again.';
    }
  }, []);

  // File input change handler
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Remove file from preview
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = useCallback(async (manualMessageOrEvent?: string | React.MouseEvent<HTMLButtonElement>) => {
    const messageToSend = typeof manualMessageOrEvent === 'string' 
      ? manualMessageOrEvent 
      : inputMessage;
      
    if (!messageToSend.trim() && selectedFiles.length === 0) return;

    // If no current chat, create one automatically
    let chatId = currentChatId;
    let isNewChat = false;
    if (!chatId || !chats.find(c => c.id === chatId)) {
      chatId = `chat_${Date.now()}`;
      isNewChat = true;
    }
    
    // Prepare file previews (simulate upload for now)
    const uploadedFiles: UploadedFile[] = selectedFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      content: messageToSend,
      sender: MessageSender.USER,
      timestamp: Date.now(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };

    if (isNewChat) {
      setChats(prev => [
        ...prev,
        {
          id: chatId,
          title: '',
          messages: [newMessage],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);
      setCurrentChatId(chatId);
    } else {
      setChats(prev =>
        prev.map(chat =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, newMessage], updatedAt: Date.now() }
            : chat
        )
      );
    }
    setInputMessage('');
    setSelectedFiles([]);
    setIsLoading(true);

    try {
      // TODO: Send files to backend (currently only message is sent)
      const aiResponseContent = await getAIResponse(messageToSend, selectedModel);

      const aiResponse: Message = {
        id: `msg_${Date.now() + 1}`,
        content: aiResponseContent,
        sender: MessageSender.AI,
        timestamp: Date.now()
      };
      
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          const aiMsg = [...chat.messages, aiResponse].filter(m => m.sender === MessageSender.AI).pop();
          if (aiMsg) {
            const words = aiMsg.content.trim().split(' ');
            let title = words.slice(0, 5).join(' ');
            title = title.charAt(0).toUpperCase() + title.slice(1);
            if (words.length > 5) title += '...';
            return { ...chat, title, messages: [...chat.messages, aiResponse], updatedAt: Date.now() };
          }
        }
        return chat;
      }));
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: `msg_${Date.now() + 1}`,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: MessageSender.AI,
        timestamp: Date.now()
      };
      setChats(prev =>
        prev.map(chat =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, errorResponse], updatedAt: Date.now() }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, getAIResponse, selectedModel, selectedFiles, currentChatId, chats]);

  // Utility for date grouping
  function getDateGroupLabel(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  // In sidebar, group chats by date
  const chatsByDate: { [label: string]: Chat[] } = {};
  for (const chat of chats) {
    const label = getDateGroupLabel(new Date(chat.updatedAt));
    if (!chatsByDate[label]) chatsByDate[label] = [];
    chatsByDate[label].push(chat);
  }

  // Add temporary chat handler
  const handleTemporaryChat = () => {
    if (isTemporaryChat) {
      // Exit temporary chat: restore last chat and conversation
      setIsTemporaryChat(false);
      const savedChats = localStorage.getItem('chats');
      const savedCurrentChatId = localStorage.getItem('currentChatId');
      if (savedChats) {
        const parsed = JSON.parse(savedChats);
        setChats(parsed);
        if (savedCurrentChatId) {
          setCurrentChatId(savedCurrentChatId);
        } else {
          setCurrentChatId(parsed[0]?.id || '');
        }
      }
    } else {
      // Enter temporary chat
      setIsTemporaryChat(true);
      setCurrentChatId('');
    }
  };

  // Modify the useEffect for saving chats
  useEffect(() => {
    if (isTemporaryChat) {
      sessionStorage.setItem('chats', JSON.stringify(chats));
    } else {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats, isTemporaryChat]);

  // Modify the useEffect for saving currentChatId
  useEffect(() => {
    if (isTemporaryChat) {
      sessionStorage.setItem('currentChatId', currentChatId);
    } else {
      localStorage.setItem('currentChatId', currentChatId);
    }
  }, [currentChatId, isTemporaryChat]);

  // Update the click outside handler
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownChatId && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownChatId(null);
      }
    }
    if (dropdownChatId) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [dropdownChatId]);

  // Add greeting function inside App component
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  // Add renderChatInput function
  const renderChatInput = () => (
    <div className="relative w-full rounded-3xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-md py-0">
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        placeholder="Ask anything"
        className="w-full border-0 bg-transparent focus:outline-none text-base pl-6 pb-16 pt-4 pr-12 rounded-3xl placeholder-gray-400 align-top"
      />
      {/* Paperclip button - bottom left */}
      <label className="absolute left-3 bottom-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center">
        <FiPaperclip size={20} />
        <input type="file" multiple className="hidden" onChange={handleFileChange} />
      </label>
      {/* Voice input button - bottom right (before submit) */}
      <button
        type="button"
        onClick={toggleListening}
        className={`absolute right-14 bottom-2 p-2 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} transition-colors flex items-center justify-center`}
        title={isListening ? "Stop listening" : "Dictate"}
      >
        {isListening ? <FiMicOff size={20} className="text-white" /> : <FiMic size={20} />}
      </button>
      {/* Submit button - bottom right */}
      <button
        type="button"
        onClick={() => handleSendMessage()}
        className="absolute right-3 bottom-2 p-2 rounded-full bg-black hover:bg-gray-900 text-white transition-colors flex items-center justify-center"
        disabled={isLoading || (!inputMessage.trim() && selectedFiles.length === 0)}
      >
        <span style={{ display: 'inline-block', transform: 'rotate(180deg)' }}>
          <FiArrowDown size={20} />
        </span>
      </button>
    </div>
  );

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Set to true for continuous listening
      recognitionRef.current.interimResults = true; // Enable interim results for real-time feedback

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setInputMessage(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Don't stop listening on no-speech errors
          return;
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        // Only stop if we're not supposed to be listening
        if (isListening) {
          try {
            recognitionRef.current?.start();
          } catch (error) {
            console.error('Error restarting speech recognition:', error);
            setIsListening(false);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]); // Add isListening as dependency

  // Update toggleListening function
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setGlobalToast('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setGlobalToast('Error starting voice input');
      }
    }
  }, [isListening]);

  if (authView && !user) {
    if (authView === 'login') {
      return (
        <Login
          onSwitchToSignup={() => setAuthView('signup')}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }
      return (
      <SignUp
          onSwitchToLogin={() => setAuthView('login')}
          onSignupSuccess={handleSignupSuccess}
        />
      );
  }

  const currentMessages = chats.find(c => c.id === currentChatId)?.messages || [];

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Temporary Chat Button - ChatGPT Style */}
      <div className="fixed top-4 right-6 z-50 flex items-center gap-3">
        {isTemporaryChat && (
          <div className="bg-white border border-gray-300 rounded-xl px-6 py-2 shadow text-base font-medium text-gray-800">
            Temporary chats won't appear in your history
          </div>
        )}
        <button
          type="button"
          onClick={handleTemporaryChat}
          className={`btn relative btn-ghost text-token-text-secondary rounded-lg ${isTemporaryChat ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          aria-label={isTemporaryChat ? "Turn off temporary chat" : "Turn on temporary chat"}
        >
          <div className="flex w-full items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 14 14"
              aria-label="Temporary chat"
              className="icon-lg"
            >
              <title>turn on temporary mode</title>
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M6.319 1.334a.667.667 0 0 1-.512.792 5.43 5.43 0 0 0-2.602 1.362.667.667 0 1 1-.918-.967A6.76 6.76 0 0 1 5.527.822a.667.667 0 0 1 .792.512m1.363 0a.667.667 0 0 1 .791-.512 6.76 6.76 0 0 1 3.24 1.699.667.667 0 1 1-.917.967 5.43 5.43 0 0 0-2.602-1.362.667.667 0 0 1-.512-.792M1.51 4.614c.348.12.533.5.413.848a4.7 4.7 0 0 0 0 3.076.667.667 0 0 1-1.26.435 6.04 6.04 0 0 1 0-3.945.666.666 0 0 1 .847-.413m10.979 0a.667.667 0 0 1 .847.414A6 6 0 0 1 13.667 7a6 6 0 0 1-.33 1.973.667.667 0 1 1-1.26-.435 4.7 4.7 0 0 0 0-3.076.667.667 0 0 1 .413-.847M2.27 10.352a.667.667 0 0 1 .479.812q-.052.2-.111.397.629-.097 1.228-.267a.67.67 0 0 1 .496.054c.445.238.93.417 1.445.528a.667.667 0 1 1-.28 1.303 7 7 0 0 1-1.553-.533c-.73.189-1.479.305-2.266.354a.667.667 0 0 1-.664-.905c.164-.425.305-.844.414-1.264a.667.667 0 0 1 .812-.48m9.468.186a.666.666 0 0 1-.024.942 6.76 6.76 0 0 1-3.24 1.7.667.667 0 0 1-.28-1.304 5.43 5.43 0 0 0 2.601-1.362.667.667 0 0 1 .943.024"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Global Toast Notification */}
      {globalToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 bg-white rounded-xl shadow-lg text-base font-medium flex items-center gap-2 border border-gray-200">
          <span className="inline-block w-5 h-5 bg-black rounded-full flex items-center justify-center text-white mr-2">
            ✓
          </span>
          {globalToast}
        </div>
      )}
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all duration-300 border-r border-[var(--border-color)]`}>
        <div className="p-2 flex flex-col h-full">
          {/* Sidebar Toggle Button */}
          <div className="flex justify-between items-center mb-4">
            {sidebarOpen && (
              <button
                type="button"
                className="flex flex-row gap-3 items-center group bg-transparent border-none outline-none"
                onClick={() => setCurrentChatId('')}
                title="Go to main page"
              >
                <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors">
                  StacXai
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-[var(--bg-secondary)] hover:bg-opacity-50 transition-colors group"
              aria-label="Toggle sidebar"
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--text-primary)] icon-lg-heavy max-md:hidden">
                <title>Close Sidebar </title>
                <path d="M8 5.4541C8 5.42548 8.00155 5.39716 8.00391 5.36914C7.55522 5.37527 7.18036 5.38745 6.85449 5.41406C6.32513 5.45732 5.99243 5.53344 5.74121 5.6416L5.6377 5.69043C5.14381 5.94215 4.73058 6.32494 4.44238 6.79492L4.32715 7.00098C4.19296 7.26434 4.10023 7.61261 4.05078 8.21777C4.00041 8.83458 4 9.62723 4 10.7637V13.2363C4 14.3728 4.00039 15.1654 4.05078 15.7822C4.10023 16.3871 4.19298 16.7347 4.32715 16.998L4.44238 17.2041C4.73056 17.6741 5.14377 18.0568 5.6377 18.3086L5.74121 18.3574C5.99244 18.4656 6.32506 18.5417 6.85449 18.585C7.17941 18.6115 7.55304 18.6228 8 18.6289V5.4541ZM22 13.2363C22 14.3396 22.001 15.2273 21.9424 15.9443C21.8903 16.5821 21.7876 17.1524 21.5605 17.6816L21.4551 17.9063C20.9758 18.8468 20.211 19.6115 19.2705 20.0908H19.2695C18.6773 20.3925 18.0373 20.5186 17.3086 20.5781C16.5914 20.6367 15.7032 20.6357 14.5996 20.6357H9.40039C9.27572 20.6357 9.15341 20.6339 9.03418 20.6338C9.02282 20.6342 9.01146 20.6357 9 20.6357C8.98557 20.6357 8.97131 20.6334 8.95703 20.6328C8.05556 20.632 7.31 20.6287 6.69141 20.5781C6.05356 20.526 5.48347 20.4235 4.9541 20.1963L4.73047 20.0908C3.84834 19.6413 3.12017 18.9412 2.6377 18.0801L2.54492 17.9063C2.24315 17.3139 2.11717 16.6732 2.05762 15.9443C1.99905 15.2273 2 14.3396 2 13.2363V10.7637C2 9.66008 1.99903 8.77186 2.05762 8.05469C2.11716 7.32598 2.24327 6.68595 2.54492 6.09375L2.6377 5.91895C3.12017 5.05789 3.8484 4.35763 4.73047 3.9082L4.9541 3.80274C5.48344 3.57561 6.05359 3.47301 6.69141 3.4209C7.40857 3.36231 8.29681 3.36328 9.40039 3.36328H14.5996C15.7032 3.36328 16.5914 3.36231 17.3086 3.4209C18.0373 3.48044 18.6773 3.60656 19.2695 3.9082L19.4443 4.00195C20.3052 4.48442 21.0057 5.21184 21.4551 6.09375L21.5605 6.31738C21.7877 6.84672 21.8903 7.41688 21.9424 8.05469C22.001 8.77186 22 9.66008 22 10.7637V13.2363ZM10 18.6357H14.5996C15.7361 18.6357 16.5287 18.6353 17.1455 18.585C17.7507 18.5355 18.0989 18.4428 18.3623 18.3086L18.5684 18.1934C19.0383 17.9051 19.4211 17.492 19.6729 16.998L19.7217 16.8945C19.8298 16.6434 19.906 16.3112 19.9492 15.7822C19.9996 15.1654 20 14.3728 20 13.2363V10.7637C20 9.62722 19.9996 8.83458 19.9492 8.21777C19.906 7.68841 19.8299 7.35572 19.7217 7.10449L19.6729 7.00098C19.4211 6.50707 19.0383 6.09385 18.5684 5.80567L18.3623 5.69043C18.0989 5.55623 17.7507 5.46351 17.1455 5.41406C16.5287 5.36369 15.736 5.36328 14.5996 5.36328H9.99609C9.99879 5.39319 10 5.42349 10 5.4541V18.6357Z" fill="currentColor" />
              </svg>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--text-primary)] icon-lg-heavy md:hidden">
                <title>Open Sidebar </title>
                <path fillRule="evenodd" clipRule="evenodd" d="M5.63603 5.63604C6.02656 5.24552 6.65972 5.24552 7.05025 5.63604L12 10.5858L16.9497 5.63604C17.3403 5.24552 17.9734 5.24552 18.364 5.63604C18.7545 6.02657 18.7545 6.65973 18.364 7.05025L13.4142 12L18.364 16.9497C18.7545 17.3403 18.7545 17.9734 18.364 18.364C17.9734 18.7545 17.3403 18.7545 16.9497 18.364L12 13.4142L7.05025 18.364C6.65972 18.7545 6.02656 18.7545 5.63603 18.364C5.24551 17.9734 5.24551 17.3403 5.63603 16.9497L10.5858 12L5.63603 7.05025C5.24551 6.65973 5.24551 6.02657 5.63603 5.63604Z" fill="currentColor" />
              </svg>
              <span className="sr-only">Toggle sidebar</span>
            </button>
          </div>

          {/* New Chat Button */}
          <button 
            type="button"
            onClick={() => setCurrentChatId('')}
            className="flex items-center gap-2 w-full px-3 py-2.5 mb-3 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors font-medium text-sm"
            style={{ minHeight: 0 }}
          >
            <FiPlus size={16} />
            <span>New chat</span>
          </button>

          <div className="flex-1 overflow-y-auto" style={{ overflow: 'visible' }}>
            {!isTemporaryChat && Object.entries(chatsByDate).map(([label, group]) => (
              <div key={label} className="mb-2">
                <div className="px-2 py-3 text-xs text-gray-500 font-semibold uppercase">{label}</div>
                {group.map(chat => (
                  <div key={chat.id} className="flex items-center w-full px-1 py-0.5 group">
                    <button
                      type="button"
                      onClick={() => setCurrentChatId(chat.id)}
                      className={`flex-2 flex items-center w-full px-3 py-1.5 rounded-md text-left transition-colors text-sm ${currentChatId === chat.id ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      style={{ minWidth: 0 }}
                    >
                      <span className="truncate flex-1">{chat.title || 'New chat'}</span>
                      {/* 3-dots menu, only visible on hover, transparent unless hovered */}
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          className="p-1 ml-1 bg-transparent group-hover:bg-gray-200 group-hover:dark:bg-gray-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                          style={{ minWidth: 0 }}
                          onClick={e => {
                            e.stopPropagation();
                            setDropdownChatId(chat.id);
                          }}
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><title>Menu</title><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>
                        </button>
                        {/* Dropdown menu, only visible for the open chat */}
                        {dropdownChatId === chat.id && (
                          <div ref={dropdownRef} className="absolute left-0 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                            <div className="py-1">
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={e => {
                                  e.stopPropagation();
                                  const newTitle = prompt('Rename chat', chat.title || 'New chat');
                                  if (newTitle !== null && newTitle.trim() !== '') {
                                    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, title: newTitle } : c));
                                  }
                                  setDropdownChatId(null);
                                }}
                              >
                                Rename
                              </button>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={e => {
                                  e.stopPropagation();
                                  setChats(prev => prev.filter(c => c.id !== chat.id));
                                  if (currentChatId === chat.id) {
                                    setCurrentChatId('');
                                  }
                                  setDropdownChatId(null);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-[var(--border-color)]">
            <div className="relative mb-2" ref={guestMenuRef}>
              <button 
                type="button"
                onClick={() => setShowGuestMenu(!showGuestMenu)}
                className="flex items-center p-2 rounded-md w-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                  {user ? user.name.charAt(0).toUpperCase() : 'G'}
                </div>
                {sidebarOpen && (
                  <div className="flex items-center ml-3 flex-1 justify-between">
                    <span>{user ? user.name : 'Guest'}</span>
                    <FiChevronDown className={`transition-transform ${showGuestMenu ? 'transform rotate-180' : ''}`} />
                  </div>
                )}
              </button>
              
              {showGuestMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-[var(--bg-primary)] rounded-md shadow-lg py-1 z-10 border border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => {
                      setDarkMode(!darkMode);
                      setShowGuestMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {darkMode ? (
                      <>
                        <FiSun className="mr-3" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <FiMoon className="mr-3" />
                        Dark Mode
                      </>
                    )}
                  </button>
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setShowGuestMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <FiLogOut className="mr-3" />
                      Log Out
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('login');
                        setShowGuestMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <FiUser className="mr-3" />
                      Sign In
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[var(--bg-primary)]">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 mr-2 rounded-md hover:bg-[var(--bg-secondary)] hover:bg-opacity-50 transition-colors md:hidden"
              aria-label="Toggle sidebar"
              title="Open sidebar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--text-primary)] icon-lg-heavy max-md:hidden">
                <title>Sidebar toggle icon</title>
                <path d="M8 5.4541C8 5.42548 8.00155 5.39716 8.00391 5.36914C7.55522 5.37527 7.18036 5.38745 6.85449 5.41406C6.32513 5.45732 5.99243 5.53344 5.74121 5.6416L5.6377 5.69043C5.14381 5.94215 4.73058 6.32494 4.44238 6.79492L4.32715 7.00098C4.19296 7.26434 4.10023 7.61261 4.05078 8.21777C4.00041 8.83458 4 9.62723 4 10.7637V13.2363C4 14.3728 4.00039 15.1654 4.05078 15.7822C4.10023 16.3871 4.19298 16.7347 4.32715 16.998L4.44238 17.2041C4.73056 17.6741 5.14377 18.0568 5.6377 18.3086L5.74121 18.3574C5.99244 18.4656 6.32506 18.5417 6.85449 18.585C7.17941 18.6115 7.55304 18.6228 8 18.6289V5.4541ZM22 13.2363C22 14.3396 22.001 15.2273 21.9424 15.9443C21.8903 16.5821 21.7876 17.1524 21.5605 17.6816L21.4551 17.9063C20.9758 18.8468 20.211 19.6115 19.2705 20.0908H19.2695C18.6773 20.3925 18.0373 20.5186 17.3086 20.5781C16.5914 20.6367 15.7032 20.6357 14.5996 20.6357H9.40039C9.27572 20.6357 9.15341 20.6339 9.03418 20.6338C9.02282 20.6342 9.01146 20.6357 9 20.6357C8.98557 20.6357 8.97131 20.6334 8.95703 20.6328C8.05556 20.632 7.31 20.6287 6.69141 20.5781C6.05356 20.526 5.48347 20.4235 4.9541 20.1963L4.73047 20.0908C3.84834 19.6413 3.12017 18.9412 2.6377 18.0801L2.54492 17.9063C2.24315 17.3139 2.11717 16.6732 2.05762 15.9443C1.99905 15.2273 2 14.3396 2 13.2363V10.7637C2 9.66008 1.99903 8.77186 2.05762 8.05469C2.11716 7.32598 2.24327 6.68595 2.54492 6.09375L2.6377 5.91895C3.12017 5.05789 3.8484 4.35763 4.73047 3.9082L4.9541 3.80274C5.48344 3.57561 6.05359 3.47301 6.69141 3.4209C7.40857 3.36231 8.29681 3.36328 9.40039 3.36328H14.5996C15.7032 3.36328 16.5914 3.36231 17.3086 3.4209C18.0373 3.48044 18.6773 3.60656 19.2695 3.9082L19.4443 4.00195C20.3052 4.48442 21.0057 5.21184 21.4551 6.09375L21.5605 6.31738C21.7877 6.84672 21.8903 7.41688 21.9424 8.05469C22.001 8.77186 22 9.66008 22 10.7637V13.2363ZM10 18.6357H14.5996C15.7361 18.6357 16.5287 18.6353 17.1455 18.585C17.7507 18.5355 18.0989 18.4428 18.3623 18.3086L18.5684 18.1934C19.0383 17.9051 19.4211 17.492 19.6729 16.998L19.7217 16.8945C19.8298 16.6434 19.906 16.3112 19.9492 15.7822C19.9996 15.1654 20 14.3728 20 13.2363V10.7637C20 9.62722 19.9996 8.83458 19.9492 8.21777C19.906 7.68841 19.8299 7.35572 19.7217 7.10449L19.6729 7.00098C19.4211 6.50707 19.0383 6.09385 18.5684 5.80567L18.3623 5.69043C18.0989 5.55623 17.7507 5.46351 17.1455 5.41406C16.5287 5.36369 15.736 5.36328 14.5996 5.36328H9.99609C9.99879 5.39319 10 5.42349 10 5.4541V18.6357Z" fill="currentColor" />
              </svg>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--text-primary)] icon-lg-heavy md:hidden">
                <title>Sidebar menu icon</title>
                <path fillRule="evenodd" clipRule="evenodd" d="M5.63603 5.63604C6.02656 5.24552 6.65972 5.24552 7.05025 5.63604L12 10.5858L16.9497 5.63604C17.3403 5.24552 17.9734 5.24552 18.364 5.63604C18.7545 6.02657 18.7545 6.65973 18.364 7.05025L13.4142 12L18.364 16.9497C18.7545 17.3403 18.7545 17.9734 18.364 18.364C17.9734 18.7545 17.3403 18.7545 16.9497 18.364L12 13.4142L7.05025 18.364C6.65972 18.7545 6.02656 18.7545 5.63603 18.364C5.24551 17.9734 5.24551 17.3403 5.63603 16.9497L10.5858 12L5.63603 7.05025C5.24551 6.65973 5.24551 6.02657 5.63603 5.63604Z" fill="currentColor" />
              </svg>
              <span className="sr-only">Toggle sidebar</span>
            </button>
            
            {/* Model Selection Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                {selectedModel}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <title>Dropdown arrow</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showModelDropdown && (
                <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] z-10">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModel('Reasoning Model');
                        setShowModelDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedModel === 'Reasoning Model' 
                          ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]' 
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                      }`}
                    >
                      Reasoning Model
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModel('Think Model');
                        setShowModelDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedModel === 'Think Model' 
                          ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]' 
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                      }`}
                    >
                      Think Model
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModel('DeepSearch Model');
                        setShowModelDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedModel === 'DeepSearch Model' 
                          ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]' 
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                      }`}
                    >
                      DeepSearch Model
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>


        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[600px] mx-auto pt-6 px-4 pb-32">
            {isLoading && currentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
                <div className="flex flex-col items-center mb-3">
                  <div 
                    role="status" 
                    className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"
                    aria-label="Loading..."
                  />
                </div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Loading...</h3>
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {user && (
                  <div className="mb-4 text-4xl font-regular text-[var(--text-primary)] text-center" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                    {getGreeting()}, {user.name.split(' ')[0]}
                  </div>
                )}
                <div className="w-full max-w-3xl px-4 mb-4">
                  {renderChatInput()}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className="w-full flex flex-col items-start">
                    {msg.sender === MessageSender.USER ? (
                      <div className="flex items-center group">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 text-black flex items-center justify-center font-bold mr-3">C</div>
                          <div className="bg-gray-100 text-black rounded-xl px-5 py-2 text-base font-medium">
                            {msg.content}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-gray-200 text-gray-500"
                          title="Edit message"
                          onClick={() => { setEditingMessageId(msg.id); setEditingMessageValue(msg.content); }}
                        >
                          <FiEdit2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start w-full mt-2 max-w-3xl">
                        <div className="text-base font-medium text-left mb-2">
                          {renderAIContent(msg.content, setGlobalToast)}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button type="button" onClick={() => {navigator.clipboard.writeText(msg.content); setGlobalToast('Copied to clipboard!'); if (globalToastTimeout.current) clearTimeout(globalToastTimeout.current); globalToastTimeout.current = setTimeout(() => setGlobalToast(null), 2000);}} className="border border-gray-300 rounded-md p-2 hover:bg-gray-100 transition-colors" title="Copy"><FiCopy /></button>
                          <button type="button" onClick={() => {setGlobalToast('Thanks for your upvote!'); if (globalToastTimeout.current) clearTimeout(globalToastTimeout.current); globalToastTimeout.current = setTimeout(() => setGlobalToast(null), 2000);}} className="border border-gray-300 rounded-md p-2 hover:bg-gray-100 transition-colors" title="Like"><FiThumbsUp /></button>
                          <button type="button" onClick={() => {setGlobalToast('Downvoted Response!'); if (globalToastTimeout.current) clearTimeout(globalToastTimeout.current); globalToastTimeout.current = setTimeout(() => setGlobalToast(null), 2000);}} className="border border-gray-300 rounded-md p-2 hover:bg-gray-100 transition-colors" title="Dislike"><FiThumbsDown /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex flex-row w-full my-8">
                    <div className="flex space-x-1 ml-11">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} className="h-20" />
          </div>
        </div>
        
        {/* Chat Input Box (when there are messages) */}
        {currentMessages.length !== 0 && (
          <div className="absolute bottom-0 left-0 right-0 w-full">
            <div className="mx-auto max-w-3xl px-4 pb-10">
              {renderChatInput()}
            </div>
          </div>
        )}
        
        <div className="px-2 py-4 text-center text-xs text-gray-500 mt-10">
          StacXai may display inaccurate info, please verify responses.
          <a href="/privacy-policy" className="underline hover:text-gray-700 ml-1">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default App;