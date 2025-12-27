'use client';

interface ToolResultCardProps {
  toolName: string;
  displayData?: {
    type: string;
    title: string;
    items: Array<{
      icon: string;
      label: string;
      value: string;
      highlight?: boolean;
    }>;
  };
}

const toolIcons: Record<string, string> = {
  diagnose_care_level: '🏥',
  apply_long_term_care: '📋',
  search_welfare_benefits: '🎁',
  search_care_facilities: '🏢',
  get_facility_detail: '📋',
  schedule_visit_survey: '📅',
  register_emergency_care: '🚨',
  share_family_calendar: '👨‍👩‍👧‍👦',
  get_government_docs: '📄',
  summarize_progress: '📊'
};

const toolLabels: Record<string, string> = {
  diagnose_care_level: '돌봄 필요도 진단',
  apply_long_term_care: '장기요양등급 신청',
  search_welfare_benefits: '복지혜택 검색',
  search_care_facilities: '요양시설 검색',
  get_facility_detail: '시설 상세정보',
  schedule_visit_survey: '방문조사 예약',
  register_emergency_care: '긴급돌봄 신청',
  share_family_calendar: '가족캘린더 공유',
  get_government_docs: '정부서류 발급',
  summarize_progress: '진행상황 요약'
};

export function ToolResultCard({ toolName, displayData }: ToolResultCardProps) {
  if (!displayData) {
    return null;
  }

  const icon = toolIcons[toolName] || '🔧';
  const typeColors: Record<string, string> = {
    diagnosis: 'from-purple-500 to-purple-600',
    benefits: 'from-emerald-500 to-emerald-600',
    facilities: 'from-blue-500 to-blue-600',
    appointment: 'from-amber-500 to-amber-600',
    calendar: 'from-pink-500 to-pink-600',
    document: 'from-gray-500 to-gray-600',
    summary: 'from-indigo-500 to-indigo-600'
  };

  const gradientClass = typeColors[displayData.type] || 'from-gray-500 to-gray-600';

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradientClass} px-4 py-3 text-white`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <div className="text-xs opacity-80">{toolLabels[toolName] || toolName}</div>
            <div className="font-semibold">{displayData.title}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white p-4">
        <div className="space-y-2">
          {displayData.items.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                item.highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className={`font-medium truncate ${item.highlight ? 'text-blue-700' : 'text-gray-800'}`}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
