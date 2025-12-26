'use client';

import { useState, useEffect, useRef } from 'react';
import { useCare } from '@/lib/context/CareContext';
import { ToolResultCard } from './ToolResultCard';
import { TypingIndicator } from './TypingIndicator';
import { Button } from '@/components/ui/button';
import { Send, RotateCcw, Loader2, AlertCircle } from 'lucide-react';

// 마크다운을 HTML로 변환하는 함수 (### 제거 포함)
function renderMarkdown(text: string) {
  // 먼저 ### 마크다운 헤딩 제거 (줄 시작의 #들)
  let cleanedText = text.replace(/^#{1,6}\s*/gm, '');

  // 볼드 처리
  const parts = cleanedText.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function AgentChatInterface() {
  const { state, sendMessage, resetConversation } = useCare();
  const { messages, isLoading, error } = state;
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
          🤖
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-lg">AI 케어브릿지</h2>
          <p className="text-blue-100 text-sm">실제 AI 에이전트 모드</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={resetConversation}
          className="text-white hover:bg-white/20"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          새 상담
        </Button>
      </div>

      {/* 상태 표시 바 */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-gray-600">
            {isLoading ? 'AI가 응답 중...' : '대기 중'}
          </span>
        </div>
        {state.careState.currentStep !== 'initial' && (
          <div className="text-blue-600">
            현재 단계: {getStepLabel(state.careState.currentStep)}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              }`}
            >
              {message.role === 'user' ? '👤' : '🤖'}
            </div>

            {/* Message Content */}
            <div
              className={`max-w-[80%] ${
                message.role === 'user' ? 'items-end' : 'items-start'
              } flex flex-col gap-2`}
            >
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-line text-[15px] leading-relaxed">
                  {renderMarkdown(message.content)}
                </p>
              </div>

              {/* Tool Results */}
              {message.toolResults?.map((tr, idx) => (
                <ToolResultCard
                  key={idx}
                  toolName={tr.toolName}
                  displayData={tr.displayData}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && <TypingIndicator />}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center gap-3">
          <textarea
            placeholder="부모님 돌봄에 대해 무엇이든 물어보세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            rows={1}
            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="h-12 w-12 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Claude AI가 도구를 사용하여 실제 정보를 검색하고 서비스를 신청합니다
        </p>
      </div>
    </div>
  );
}

function getStepLabel(step: string): string {
  const labels: Record<string, string> = {
    initial: '초기 상담',
    health_assessment: '건강 상태 파악',
    diagnosis: '돌봄 수준 진단',
    grade_application: '등급 신청',
    emergency_care: '긴급 돌봄',
    benefit_discovery: '복지 혜택 발굴',
    facility_search: '시설 검색',
    family_calendar: '가족 캘린더',
    completed: '상담 완료'
  };
  return labels[step] || step;
}
