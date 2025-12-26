'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function TypingIndicator() {
  const [dots, setDots] = useState('');
  const [statusText, setStatusText] = useState('AI가 답변을 준비하고 있습니다');

  // 점 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 상태 텍스트 변경 (시간이 오래 걸릴 때 안내)
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatusText('정보를 분석하고 있습니다');
    }, 3000);
    const timer2 = setTimeout(() => {
      setStatusText('최적의 답변을 작성 중입니다');
    }, 6000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="flex items-start gap-3 message-agent animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-lg shadow-emerald-500/30">
        🤖
      </div>
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          <span className="text-emerald-700 font-medium">
            {statusText}{dots}
          </span>
        </div>
        <div className="flex gap-1.5 mt-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
