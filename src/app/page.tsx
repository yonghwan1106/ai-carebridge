'use client';

import { useState } from 'react';
import { ChatInterface, AgentChatInterface } from '@/components/chat';
import { CareProvider } from '@/lib/context/CareContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Monitor, Smartphone, ArrowRight, CheckCircle2, Bot, Sparkles } from 'lucide-react';

export default function Home() {
  const [mode, setMode] = useState<'landing' | 'demo' | 'video' | 'agent'>('landing');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="relative max-w-6xl mx-auto px-6 py-20">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <Badge className="bg-white/20 text-white border-white/30 px-6 py-2 text-sm">
                2025 AI 에이전트 서비스 시나리오 공모전 | 결선 진출작
              </Badge>
            </div>

            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl font-black text-center mb-6 tracking-tight">
              AI 케어브릿지
            </h1>

            <p className="text-2xl md:text-3xl text-center text-blue-100 mb-4">
              부모님 돌봄 시작을 위한 원스톱 통합 지원 서비스
            </p>

            <p className="text-lg text-center text-blue-200 italic mb-12 max-w-2xl mx-auto">
              &quot;복잡한 돌봄 행정의 다리가 되어, 가족이 사랑에만 집중할 수 있도록&quot;
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              {/* AI Agent Mode - Primary */}
              <Button
                size="lg"
                onClick={() => setMode('agent')}
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-lg px-8 py-6 rounded-xl gap-3 shadow-lg shadow-emerald-500/30"
              >
                <Sparkles className="w-5 h-5" />
                AI 에이전트 체험
                <Badge className="bg-white/20 text-white text-xs ml-1">NEW</Badge>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                onClick={() => setMode('demo')}
                className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-6 rounded-xl gap-3"
              >
                <Play className="w-5 h-5" />
                시나리오 데모
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setMode('video')}
                className="border-white/50 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl gap-3"
              >
                <Monitor className="w-5 h-5" />
                영상 녹화 모드
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {[
                { icon: '🔍', title: '스마트 돌봄 진단' },
                { icon: '📝', title: '등급 신청 대행' },
                { icon: '🎁', title: '숨은 복지 발굴' },
                { icon: '🏢', title: '돌봄자원 연결' },
                { icon: '👪', title: '가족 네트워크' },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20"
                >
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <div className="text-sm font-medium">{feature.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Agent Feature Highlight */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 py-12 border-y border-white/10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Bot className="w-8 h-8 text-emerald-400" />
                  <h3 className="text-2xl font-bold">실제 작동하는 AI 에이전트</h3>
                </div>
                <p className="text-blue-100 mb-4">
                  시나리오 데모를 넘어, Claude AI가 실제로 도구를 사용하여
                  돌봄 상담을 진행합니다. 자유롭게 대화하며 맞춤형 서비스를 경험하세요.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Tool Use', 'Claude API', '실시간 응답', '맞춤형 상담'].map((tag) => (
                    <Badge key={tag} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button
                  size="lg"
                  onClick={() => setMode('agent')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl"
                >
                  지금 체험하기 →
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/5 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center mb-10">기대효과</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '84%↓', label: '행정 처리 시간 단축' },
                { value: '100%↓', label: '방문 기관 수 감소' },
                { value: '50%↑', label: '복지 수급률 향상' },
                { value: '430만원', label: '연간 추가 혜택' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-10 text-center text-blue-300">
          <p>제작: 박용환 | 2025 AI 에이전트 서비스 시나리오 공모전</p>
        </div>
      </div>
    );
  }

  // Agent Mode
  if (mode === 'agent') {
    return (
      <CareProvider>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setMode('landing')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>돌아가기</span>
            </button>

            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-emerald-600" />
              <h1 className="font-bold text-lg">AI 케어브릿지 - AI 에이전트</h1>
            </div>

            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-2">
              <Sparkles className="w-3 h-3" />
              Claude AI 연동
            </Badge>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="w-full max-w-4xl h-[80vh] shadow-2xl rounded-2xl overflow-hidden">
              <AgentChatInterface />
            </div>
          </main>

          {/* Info Bar */}
          <div className="bg-emerald-50 border-t border-emerald-200 px-6 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 text-sm text-emerald-700">
              <span>💡 자유롭게 대화하세요. AI가 상황에 맞는 도구를 자동으로 사용합니다.</span>
            </div>
          </div>
        </div>
      </CareProvider>
    );
  }

  // Demo Mode or Video Mode
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => setMode('landing')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>돌아가기</span>
        </button>

        <h1 className="font-bold text-lg">
          AI 케어브릿지 {mode === 'video' ? '- 영상 녹화 모드' : '- 시나리오 데모'}
        </h1>

        {mode === 'demo' && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={deviceView === 'desktop' ? 'default' : 'outline'}
              onClick={() => setDeviceView('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={deviceView === 'mobile' ? 'default' : 'outline'}
              onClick={() => setDeviceView('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        )}

        {mode === 'video' && (
          <Badge variant="destructive" className="gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            녹화 모드
          </Badge>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex items-center justify-center">
        <div
          className={`${
            mode === 'video'
              ? 'w-full max-w-5xl h-[80vh]'
              : deviceView === 'mobile'
              ? 'w-[400px] h-[800px]'
              : 'w-full max-w-4xl h-[80vh]'
          } shadow-2xl rounded-2xl overflow-hidden`}
        >
          <ChatInterface autoPlay={mode === 'video'} />
        </div>
      </main>

      {/* Instructions for Video Mode */}
      {mode === 'video' && (
        <div className="bg-amber-50 border-t border-amber-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 text-sm">
              <strong>녹화 방법:</strong> Win+G (Xbox Game Bar) 또는 OBS로 화면을 녹화하세요.
              [재생] 버튼을 클릭하면 2분 동안 시나리오가 자동 재생됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
