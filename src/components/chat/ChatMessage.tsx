'use client';

import { Message } from '@/lib/scenario-data';
import { Badge } from '@/components/ui/badge';

interface ChatMessageProps {
  message: Message;
  onOptionClick?: (value: string) => void;
  isAutoPlay?: boolean;
}

export function ChatMessage({ message, onOptionClick, isAutoPlay = false }: ChatMessageProps) {
  const isUser = message.type === 'user';

  return (
    <div
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse message-user' : 'message-agent'}`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
        }`}
      >
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Message Content */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
          }`}
        >
          {/* Main content */}
          <p className="whitespace-pre-line text-[15px] leading-relaxed">{message.content}</p>

          {/* Options */}
          {message.options && (
            <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-2">
              {message.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => !isAutoPlay && onOptionClick?.(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    isAutoPlay
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 cursor-pointer'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* Summary Box */}
          {message.summary && (
            <div className="mt-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h5 className="font-semibold text-gray-800 mb-3">{message.summary.title}</h5>
              <div className="space-y-2">
                {message.summary.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-sm ${
                      item.highlight ? 'text-emerald-600 font-medium' : 'text-gray-600'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Service Tag */}
        {message.serviceTag && (
          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            🏛️ {message.serviceTag}
          </Badge>
        )}
      </div>
    </div>
  );
}
