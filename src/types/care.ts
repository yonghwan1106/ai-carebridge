// 돌봄 서비스 관련 공통 타입 정의

// 사용자 정보
export interface UserInfo {
  name: string;
  phone: string;
  relationship: '자녀' | '배우자' | '손자녀' | '기타';
}

// 부모님(피돌봄자) 정보
export interface ParentInfo {
  name: string;
  birthDate: string;
  age: number;
  gender: '남' | '여';
  address: string;
  phone?: string;
  livingAlone: boolean;
}

// 건강 상태
export interface HealthStatus {
  mobility: 'independent' | 'assisted' | 'dependent';  // 이동 능력
  eating: 'independent' | 'assisted' | 'dependent';    // 식사 능력
  toileting: 'independent' | 'assisted' | 'dependent'; // 화장실 사용
  bathing: 'independent' | 'assisted' | 'dependent';   // 목욕
  dressing: 'independent' | 'assisted' | 'dependent';  // 옷입기
  cognitiveState: 'normal' | 'mild' | 'moderate' | 'severe'; // 인지 상태
  recentIncident?: string; // 최근 사고/질병
  chronicConditions: string[]; // 만성질환
}

// 돌봄 수준 진단 결과
export interface CareLevelDiagnosis {
  estimatedGrade: '1등급' | '2등급' | '3등급' | '4등급' | '5등급' | '인지지원등급' | '등급외';
  adlScore: number;  // 일상생활수행능력 점수
  cognitiveScore: number; // 인지기능 점수
  nursingNeedScore: number; // 간호처치 필요도
  recommendation: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

// 복지 혜택
export interface WelfareBenefit {
  id: string;
  name: string;
  category: '소득지원' | '돌봄서비스' | '의료지원' | '주거지원' | '교통지원' | '기타';
  description: string;
  eligibility: string[];
  monthlyAmount?: number;
  applicationUrl?: string;
  agency: string;
  phone?: string;
}

// 요양 시설
export interface CareFacility {
  id: string;
  name: string;
  type: '주간보호센터' | '요양원' | '재가서비스' | '양로원' | '요양병원';
  address: string;
  distance?: number;
  rating: number;
  reviewCount: number;
  monthlyFee: {
    min: number;
    max: number;
  };
  specialties: string[];
  availableSlots: boolean;
  phone: string;
  website?: string;
  // 상세 정보 (선택적)
  detailInfo?: FacilityDetailInfo;
}

// 시설 상세 정보
export interface FacilityDetailInfo {
  totalCapacity?: number;      // 정원
  currentOccupancy?: number;   // 현원
  employeeCount?: number;      // 종사자수
  representative?: string;     // 대표자명
  establishedDate?: string;    // 개업일자
  homepage?: string;           // 홈페이지
  programs?: string[];         // 프로그램 정보
  latitude?: number;           // 위도
  longitude?: number;          // 경도
  grade?: string;              // 평가등급 (A~E)
  establishType?: string;      // 설립유형 (법인, 개인 등)
}

// 예약 정보
export interface Appointment {
  id: string;
  type: '방문조사' | '시설견학' | '상담예약' | '서비스시작';
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

// 가족 캘린더 이벤트
export interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  assignee?: string;
  type: '방문' | '병원' | '서비스' | '기타';
  recurring?: 'daily' | 'weekly' | 'monthly';
}

// 전체 돌봄 상태
export interface CareState {
  userInfo?: UserInfo;
  parentInfo?: ParentInfo;
  healthStatus?: HealthStatus;
  diagnosis?: CareLevelDiagnosis;
  discoveredBenefits: WelfareBenefit[];
  nearbyFacilities: CareFacility[];
  appointments: Appointment[];
  familyEvents: FamilyEvent[];
  currentStep: CareStep;
  completedSteps: CareStep[];
  // 즐겨찾기 & 비교 기능
  favoriteFacilities: string[];  // 즐겨찾기한 시설 ID 목록
  compareFacilities: string[];   // 비교할 시설 ID 목록 (최대 3개)
  selectedFacility?: CareFacility; // 현재 선택된 시설 (상세 보기용)
}

// 돌봄 진행 단계
export type CareStep =
  | 'initial'           // 초기 상담
  | 'health_assessment' // 건강 상태 파악
  | 'diagnosis'         // 돌봄 수준 진단
  | 'grade_application' // 등급 신청
  | 'emergency_care'    // 긴급 돌봄 연결
  | 'benefit_discovery' // 복지 혜택 발굴
  | 'facility_search'   // 시설 검색
  | 'family_calendar'   // 가족 캘린더
  | 'completed';        // 완료

// 채팅 메시지 (에이전트용)
export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

// 도구 호출
export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

// 도구 결과
export interface ToolResult {
  toolCallId: string;
  toolName: string;
  result: unknown;
  displayData?: {
    type: 'diagnosis' | 'benefits' | 'facilities' | 'appointment' | 'calendar' | 'document' | 'summary';
    title: string;
    items: Array<{
      icon: string;
      label: string;
      value: string;
      highlight?: boolean;
    }>;
  };
}
