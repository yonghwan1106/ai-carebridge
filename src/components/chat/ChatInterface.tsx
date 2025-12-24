'use client';

import { useState, useEffect, useRef } from 'react';
import { Message, scenarioMessages } from '@/lib/scenario-data';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Send, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface ChatInterfaceProps {
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function ChatInterface({ autoPlay = false, onComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Total duration calculation (approximately 2 minutes)
  const totalDuration = 120000; // 2 minutes in ms

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-play logic
  useEffect(() => {
    if (autoPlay && isPlaying && currentIndex < scenarioMessages.length) {
      const currentMessage = scenarioMessages[currentIndex];
      const delay = currentMessage.delay || 2000;

      // Show typing indicator for agent messages
      if (currentMessage.type === 'agent') {
        setIsTyping(true);
        timerRef.current = setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, currentMessage]);
          setCurrentIndex((prev) => prev + 1);
        }, delay);
      } else {
        // User messages appear after delay
        timerRef.current = setTimeout(() => {
          setMessages((prev) => [...prev, currentMessage]);
          setCurrentIndex((prev) => prev + 1);
        }, delay);
      }
    } else if (autoPlay && currentIndex >= scenarioMessages.length) {
      setIsPlaying(false);
      onComplete?.();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoPlay, isPlaying, currentIndex, onComplete]);

  // Progress and timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      if (startTimeRef.current === 0) {
        startTimeRef.current = Date.now() - elapsedTime;
      }

      interval = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedTime(elapsed);
        setProgress(Math.min((elapsed / totalDuration) * 100, 100));
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, elapsedTime]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    startTimeRef.current = 0;
  };

  const handleReset = () => {
    setIsPlaying(false);
    setMessages([]);
    setCurrentIndex(0);
    setProgress(0);
    setElapsedTime(0);
    setIsTyping(false);
    startTimeRef.current = 0;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || autoPlay) return;
    // For manual mode, just clear input
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
          🤖
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-lg">AI 케어브릿지</h2>
          <p className="text-blue-100 text-sm">부모님 돌봄 원스톱 지원 서비스</p>
        </div>
        {autoPlay && (
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full pulse" />
            <span>LIVE DEMO</span>
          </div>
        )}
      </div>

      {/* Auto-play Controls */}
      {autoPlay && (
        <div className="bg-white border-b px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <Button size="sm" onClick={handlePlay} className="gap-2">
                <Play className="w-4 h-4" />
                재생
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={handlePause} className="gap-2">
                <Pause className="w-4 h-4" />
                일시정지
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              처음부터
            </Button>
          </div>

          <div className="flex-1 flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm font-mono text-gray-600 w-16">
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Scenario Context */}
        {messages.length === 0 && !isPlaying && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2">
              <span>👤</span>
              <span>상황 설정</span>
            </div>
            <p className="text-amber-800 text-sm leading-relaxed">
              50대 직장인 김민수 씨. 80세 어머니가 최근 낙상 사고 후 거동이 불편해지셨습니다.
              혼자 사시는 어머니를 어떻게 돌봐야 할지 막막한 상황에서 AI 케어브릿지를 사용합니다.
            </p>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} isAutoPlay={autoPlay} />
        ))}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder={autoPlay ? '자동 재생 모드입니다' : '메시지를 입력하세요...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={autoPlay}
            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSendMessage}
            disabled={autoPlay || !inputValue.trim()}
            className="h-12 w-12 rounded-xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
