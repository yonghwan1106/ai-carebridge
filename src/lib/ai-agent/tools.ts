// AI 케어브릿지 에이전트 도구 정의

import type { ClaudeTool, ToolHandler, ToolRegistry } from './types';
import type { CareState, CareLevelDiagnosis, WelfareBenefit, CareFacility, Appointment } from '@/types/care';
import { WELFARE_BENEFITS } from '@/lib/mock-data/welfare-benefits';
import { CARE_FACILITIES } from '@/lib/mock-data/care-facilities';
import { searchLtcFacilities, getLtcFacilityDetail } from '@/lib/api/public-data-api';
import { searchWelfareServices } from '@/lib/api/welfare-api';

// ============================================
// Tool Definitions (Claude API 형식)
// ============================================

const diagnoseCareLevel: ClaudeTool = {
  name: 'diagnose_care_level',
  description: '부모님의 건강 상태를 바탕으로 예상 장기요양등급과 돌봄 필요도를 진단합니다. 식사, 이동, 화장실 사용, 인지 상태 등의 정보를 입력하면 예상 등급과 권장 서비스를 알려드립니다.',
  input_schema: {
    type: 'object',
    properties: {
      mobility: {
        type: 'string',
        description: '이동 능력: independent(독립적), assisted(도움 필요), dependent(의존적)',
        enum: ['independent', 'assisted', 'dependent']
      },
      eating: {
        type: 'string',
        description: '식사 능력: independent(독립적), assisted(도움 필요), dependent(의존적)',
        enum: ['independent', 'assisted', 'dependent']
      },
      toileting: {
        type: 'string',
        description: '화장실 사용: independent(독립적), assisted(도움 필요), dependent(의존적)',
        enum: ['independent', 'assisted', 'dependent']
      },
      cognitiveState: {
        type: 'string',
        description: '인지 상태: normal(정상), mild(경도), moderate(중등도), severe(중증)',
        enum: ['normal', 'mild', 'moderate', 'severe']
      },
      recentIncident: {
        type: 'string',
        description: '최근 발생한 사고나 질병 (예: 낙상, 뇌졸중 등)'
      },
      age: {
        type: 'number',
        description: '부모님 연세'
      }
    },
    required: ['mobility', 'eating', 'toileting', 'cognitiveState']
  }
};

const applyLongTermCare: ClaudeTool = {
  name: 'apply_long_term_care',
  description: '장기요양등급 신청을 진행합니다. 개인정보와 건강 상태를 입력하면 국민건강보험공단에 신청서를 제출하고 방문조사 일정을 안내합니다.',
  input_schema: {
    type: 'object',
    properties: {
      parentName: {
        type: 'string',
        description: '부모님 성함'
      },
      birthDate: {
        type: 'string',
        description: '부모님 생년월일 (YYYY-MM-DD)'
      },
      address: {
        type: 'string',
        description: '부모님 거주지 주소'
      },
      phone: {
        type: 'string',
        description: '연락 가능한 전화번호'
      },
      applicantName: {
        type: 'string',
        description: '신청인(자녀) 성함'
      },
      applicantRelation: {
        type: 'string',
        description: '신청인과 부모님의 관계',
        enum: ['자녀', '배우자', '손자녀', '기타']
      }
    },
    required: ['parentName', 'birthDate', 'address', 'phone', 'applicantName']
  }
};

const searchWelfareBenefits: ClaudeTool = {
  name: 'search_welfare_benefits',
  description: '부모님이 받을 수 있는 복지 혜택을 검색합니다. 나이, 소득 수준, 건강 상태 등을 고려하여 숨은 복지 혜택을 발굴합니다.',
  input_schema: {
    type: 'object',
    properties: {
      age: {
        type: 'number',
        description: '부모님 연세'
      },
      incomeLevel: {
        type: 'string',
        description: '소득 수준: low(저소득), middle(중위소득), high(고소득)',
        enum: ['low', 'middle', 'high']
      },
      region: {
        type: 'string',
        description: '거주 지역 (예: 서울시 강남구)'
      },
      hasLongTermCareGrade: {
        type: 'boolean',
        description: '장기요양등급 보유 여부'
      },
      conditions: {
        type: 'array',
        description: '해당하는 조건들 (예: 독거노인, 치매, 장애 등)',
        items: { type: 'string' }
      }
    },
    required: ['age']
  }
};

const searchCareFacilities: ClaudeTool = {
  name: 'search_care_facilities',
  description: '주변 요양시설(주간보호센터, 요양원, 재가서비스 등)을 검색합니다.',
  input_schema: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: '검색 기준 위치 (예: 서울시 강남구)'
      },
      facilityType: {
        type: 'string',
        description: '시설 유형',
        enum: ['주간보호센터', '요양원', '재가서비스', '양로원', '요양병원', '전체']
      },
      maxBudget: {
        type: 'number',
        description: '월 예산 상한 (만원 단위)'
      },
      specialties: {
        type: 'array',
        description: '원하는 특화 서비스 (예: 치매전문, 재활, 물리치료)',
        items: { type: 'string' }
      }
    },
    required: ['location']
  }
};

const scheduleVisitSurvey: ClaudeTool = {
  name: 'schedule_visit_survey',
  description: '장기요양등급 판정을 위한 방문조사 일정을 예약합니다.',
  input_schema: {
    type: 'object',
    properties: {
      preferredDate: {
        type: 'string',
        description: '희망 방문 날짜 (YYYY-MM-DD)'
      },
      preferredTime: {
        type: 'string',
        description: '희망 시간대',
        enum: ['오전', '오후', '상관없음']
      },
      address: {
        type: 'string',
        description: '방문 주소'
      },
      contactPhone: {
        type: 'string',
        description: '연락처'
      },
      notes: {
        type: 'string',
        description: '특이사항 (예: 주차 가능, 엘리베이터 없음 등)'
      }
    },
    required: ['preferredDate', 'address', 'contactPhone']
  }
};

const registerEmergencyCare: ClaudeTool = {
  name: 'register_emergency_care',
  description: '긴급 돌봄 서비스(돌봄SOS, 긴급복지지원 등)를 신청합니다.',
  input_schema: {
    type: 'object',
    properties: {
      serviceType: {
        type: 'string',
        description: '서비스 유형',
        enum: ['돌봄SOS', '긴급복지지원', '노인맞춤돌봄', '치매안심센터']
      },
      urgencyLevel: {
        type: 'string',
        description: '긴급도',
        enum: ['즉시', '24시간내', '일주일내']
      },
      situation: {
        type: 'string',
        description: '현재 상황 설명'
      },
      address: {
        type: 'string',
        description: '서비스 제공 주소'
      },
      contactPhone: {
        type: 'string',
        description: '연락처'
      }
    },
    required: ['serviceType', 'urgencyLevel', 'address', 'contactPhone']
  }
};

const shareFamilyCalendar: ClaudeTool = {
  name: 'share_family_calendar',
  description: '가족 간 돌봄 일정을 공유하고 조율합니다.',
  input_schema: {
    type: 'object',
    properties: {
      familyMembers: {
        type: 'array',
        description: '가족 구성원 목록 (이름과 연락처)',
        items: { type: 'string' }
      },
      events: {
        type: 'array',
        description: '등록할 일정 목록',
        items: { type: 'string' }
      },
      shareMethod: {
        type: 'string',
        description: '공유 방법',
        enum: ['카카오톡', '문자메시지', '이메일']
      }
    },
    required: ['familyMembers']
  }
};

const getGovernmentDocs: ClaudeTool = {
  name: 'get_government_docs',
  description: '정부24를 통해 필요한 서류를 발급합니다.',
  input_schema: {
    type: 'object',
    properties: {
      docType: {
        type: 'string',
        description: '서류 종류',
        enum: ['가족관계증명서', '주민등록등본', '소득금액증명', '건강보험자격득실확인서']
      },
      purpose: {
        type: 'string',
        description: '발급 목적'
      }
    },
    required: ['docType']
  }
};

const summarizeProgress: ClaudeTool = {
  name: 'summarize_progress',
  description: '현재까지 진행된 상담 내용과 완료된 서비스를 요약합니다.',
  input_schema: {
    type: 'object',
    properties: {
      includeNextSteps: {
        type: 'boolean',
        description: '다음 단계 안내 포함 여부'
      }
    },
    required: []
  }
};

const getFacilityDetail: ClaudeTool = {
  name: 'get_facility_detail',
  description: '특정 요양시설의 상세 정보(정원, 현원, 종사자수, 프로그램 등)를 조회합니다.',
  input_schema: {
    type: 'object',
    properties: {
      facilityId: {
        type: 'string',
        description: '시설 ID (장기요양기관기호)'
      },
      facilityName: {
        type: 'string',
        description: '시설명 (ID가 없을 경우)'
      }
    },
    required: ['facilityId']
  }
};

// ============================================
// Tool Handlers (실제 로직)
// ============================================

const handleDiagnoseCareLevel: ToolHandler = async (input, state) => {
  const { mobility, eating, toileting, cognitiveState, recentIncident, age } = input as {
    mobility: string;
    eating: string;
    toileting: string;
    cognitiveState: string;
    recentIncident?: string;
    age?: number;
  };

  // ADL 점수 계산 (간단한 로직)
  const adlScores: Record<string, number> = {
    independent: 0,
    assisted: 1,
    dependent: 2
  };

  const cognitiveScores: Record<string, number> = {
    normal: 0,
    mild: 1,
    moderate: 2,
    severe: 3
  };

  const adlScore = (adlScores[mobility] || 0) + (adlScores[eating] || 0) + (adlScores[toileting] || 0);
  const cognitiveScore = cognitiveScores[cognitiveState] || 0;
  const totalScore = adlScore + cognitiveScore;

  // 등급 추정
  let estimatedGrade: CareLevelDiagnosis['estimatedGrade'];
  let urgencyLevel: CareLevelDiagnosis['urgencyLevel'];

  if (totalScore >= 8) {
    estimatedGrade = '1등급';
    urgencyLevel = 'critical';
  } else if (totalScore >= 6) {
    estimatedGrade = '2등급';
    urgencyLevel = 'high';
  } else if (totalScore >= 4) {
    estimatedGrade = '3등급';
    urgencyLevel = 'medium';
  } else if (totalScore >= 2) {
    estimatedGrade = '4등급';
    urgencyLevel = 'medium';
  } else if (cognitiveScore >= 1) {
    estimatedGrade = '인지지원등급';
    urgencyLevel = 'low';
  } else {
    estimatedGrade = '등급외';
    urgencyLevel = 'low';
  }

  // 최근 사고 반영
  if (recentIncident && recentIncident.includes('낙상')) {
    urgencyLevel = urgencyLevel === 'low' ? 'medium' : urgencyLevel;
  }

  const diagnosis: CareLevelDiagnosis = {
    estimatedGrade,
    adlScore: adlScore * 10,
    cognitiveScore: cognitiveScore * 10,
    nursingNeedScore: totalScore * 5,
    recommendation: getRecommendation(estimatedGrade),
    urgencyLevel
  };

  return {
    result: diagnosis,
    stateUpdate: { diagnosis },
    displayData: {
      type: 'diagnosis',
      title: '돌봄 필요도 진단 결과',
      items: [
        { icon: '🏥', label: '예상 등급', value: estimatedGrade, highlight: true },
        { icon: '📊', label: 'ADL 점수', value: `${diagnosis.adlScore}점` },
        { icon: '🧠', label: '인지기능 점수', value: `${diagnosis.cognitiveScore}점` },
        { icon: '⚡', label: '긴급도', value: getUrgencyLabel(urgencyLevel) },
        { icon: '💡', label: '권장 서비스', value: diagnosis.recommendation }
      ]
    }
  };
};

const handleApplyLongTermCare: ToolHandler = async (input, state) => {
  const { parentName, birthDate, address, phone, applicantName, applicantRelation } = input as {
    parentName: string;
    birthDate: string;
    address: string;
    phone: string;
    applicantName: string;
    applicantRelation?: string;
  };

  // 신청번호 생성
  const applicationNumber = `LTC-${Date.now().toString().slice(-8)}`;

  // 예상 방문조사 날짜 (신청 후 2주 내)
  const surveyDate = new Date();
  surveyDate.setDate(surveyDate.getDate() + 14);

  const appointment: Appointment = {
    id: `apt-${Date.now()}`,
    type: '방문조사',
    date: surveyDate.toISOString().split('T')[0],
    time: '오전 10:00',
    location: address,
    status: 'scheduled',
    notes: `신청번호: ${applicationNumber}`
  };

  return {
    result: {
      applicationNumber,
      status: '신청완료',
      parentName,
      expectedSurveyDate: surveyDate.toISOString().split('T')[0],
      agency: '국민건강보험공단'
    },
    stateUpdate: {
      parentInfo: {
        name: parentName,
        birthDate,
        age: calculateAge(birthDate),
        gender: '여', // 기본값
        address,
        livingAlone: false
      },
      appointments: [...(state.appointments || []), appointment],
      currentStep: 'grade_application' as const,
      completedSteps: [...(state.completedSteps || []), 'health_assessment' as const]
    },
    displayData: {
      type: 'appointment',
      title: '장기요양등급 신청 완료',
      items: [
        { icon: '✅', label: '신청 상태', value: '접수 완료', highlight: true },
        { icon: '📋', label: '신청번호', value: applicationNumber },
        { icon: '👤', label: '신청 대상', value: parentName },
        { icon: '📅', label: '방문조사 예정일', value: formatDate(surveyDate) },
        { icon: '🏢', label: '처리 기관', value: '국민건강보험공단' }
      ]
    }
  };
};

const handleSearchWelfareBenefits: ToolHandler = async (input, state) => {
  const { age, incomeLevel, region, hasLongTermCareGrade, conditions } = input as {
    age: number;
    incomeLevel?: string;
    region?: string;
    hasLongTermCareGrade?: boolean;
    conditions?: string[];
  };

  let benefits: WelfareBenefit[] = [];
  let totalCount = 0;
  let isRealData = false;

  // 1. 공공데이터포털 복지서비스 API 호출 시도
  try {
    const apiResult = await searchWelfareServices({
      age,
      region,
      conditions,
      incomeLevel
    });

    if (apiResult.benefits.length > 0) {
      benefits = apiResult.benefits;
      totalCount = apiResult.totalCount;
      isRealData = apiResult.isRealData;
    }
  } catch (error) {
    console.log('복지서비스 API 호출 실패, Mock 데이터 사용:', error);
  }

  // 2. API 결과가 없으면 Mock 데이터 사용
  if (benefits.length === 0) {
    benefits = WELFARE_BENEFITS.filter(b => {
      if (age < 65 && b.eligibility.includes('65세 이상')) return false;
      if (incomeLevel === 'high' && b.eligibility.includes('저소득')) return false;
      return true;
    });
    benefits = benefits.slice(0, 5);
    totalCount = benefits.length;
  }

  const totalMonthlyAmount = benefits
    .filter(b => b.monthlyAmount)
    .reduce((sum, b) => sum + (b.monthlyAmount || 0), 0);

  return {
    result: {
      benefits,
      totalMonthlyAmount,
      totalCount,
      dataSource: isRealData ? '복지로 (한국사회보장정보원)' : '샘플 데이터'
    },
    stateUpdate: {
      discoveredBenefits: benefits,
      currentStep: 'benefit_discovery' as const
    },
    displayData: {
      type: 'benefits',
      title: isRealData
        ? `📡 실시간 복지혜택 검색 결과 (총 ${totalCount}건)`
        : '발굴된 복지 혜택',
      items: [
        {
          icon: isRealData ? '📡' : '🎁',
          label: isRealData ? '실시간 데이터' : '발굴된 혜택 수',
          value: `${benefits.length}개${isRealData ? ` (전체 ${totalCount}건)` : ''}`,
          highlight: true
        },
        { icon: '💰', label: '예상 월 수령액', value: `약 ${(totalMonthlyAmount / 10000).toFixed(0)}만원` },
        ...benefits.slice(0, 3).map(b => ({
          icon: '✨',
          label: b.name.length > 15 ? b.name.substring(0, 15) + '...' : b.name,
          value: b.monthlyAmount ? `월 ${(b.monthlyAmount / 10000).toFixed(0)}만원` : '지원',
          highlight: false
        }))
      ]
    }
  };
};

const handleSearchCareFacilities: ToolHandler = async (input, state) => {
  const { location, facilityType, maxBudget, specialties } = input as {
    location: string;
    facilityType?: string;
    maxBudget?: number;
    specialties?: string[];
  };

  let facilities: CareFacility[] = [];
  let totalCount = 0;
  let isRealData = false;

  // 1. 공공데이터포털 API 호출 시도
  try {
    const apiResult = await searchLtcFacilities({
      location,
      facilityType: facilityType || '전체',
      numOfRows: 10
    });

    if (apiResult.facilities.length > 0) {
      facilities = apiResult.facilities;
      totalCount = apiResult.totalCount;
      isRealData = true;

      // 예산 필터링
      if (maxBudget) {
        facilities = facilities.filter(f => f.monthlyFee.min <= maxBudget * 10000);
      }

      // 평점순 정렬
      facilities = facilities.sort((a, b) => b.rating - a.rating).slice(0, 5);
    }
  } catch (error) {
    console.log('API 호출 실패, Mock 데이터 사용:', error);
  }

  // 2. API 결과가 없으면 Mock 데이터 사용
  if (facilities.length === 0) {
    facilities = CARE_FACILITIES.filter(f => {
      if (facilityType && facilityType !== '전체' && f.type !== facilityType) return false;
      if (maxBudget && f.monthlyFee.min > maxBudget * 10000) return false;
      return true;
    });
    facilities = facilities.sort((a, b) => b.rating - a.rating).slice(0, 5);
    totalCount = facilities.length;
  }

  return {
    result: {
      facilities,
      totalCount,
      dataSource: isRealData ? '공공데이터포털 (국민건강보험공단)' : '샘플 데이터'
    },
    stateUpdate: {
      nearbyFacilities: facilities,
      currentStep: 'facility_search' as const
    },
    displayData: {
      type: 'facilities',
      title: isRealData
        ? `📡 실시간 요양시설 검색 결과 (총 ${totalCount}개 중 상위 ${facilities.length}개)`
        : '주변 요양시설 검색 결과',
      items: [
        {
          icon: isRealData ? '📡' : '🏢',
          label: isRealData ? '실시간 데이터' : '검색된 시설',
          value: `${facilities.length}곳${isRealData ? ` (전체 ${totalCount}개)` : ''}`,
          highlight: true
        },
        ...facilities.slice(0, 4).map(f => ({
          icon: f.type === '주간보호센터' ? '🌞' : '🏥',
          label: f.name,
          value: `⭐${f.rating} | ${(f.monthlyFee.min / 10000).toFixed(0)}~${(f.monthlyFee.max / 10000).toFixed(0)}만원`,
          highlight: false
        }))
      ]
    }
  };
};

const handleScheduleVisitSurvey: ToolHandler = async (input, state) => {
  const { preferredDate, preferredTime, address, contactPhone, notes } = input as {
    preferredDate: string;
    preferredTime?: string;
    address: string;
    contactPhone: string;
    notes?: string;
  };

  const appointment: Appointment = {
    id: `visit-${Date.now()}`,
    type: '방문조사',
    date: preferredDate,
    time: preferredTime === '오전' ? '10:00' : '14:00',
    location: address,
    status: 'scheduled',
    notes
  };

  return {
    result: { confirmed: true, appointment },
    stateUpdate: {
      appointments: [...(state.appointments || []), appointment]
    },
    displayData: {
      type: 'appointment',
      title: '방문조사 예약 완료',
      items: [
        { icon: '✅', label: '예약 상태', value: '확정', highlight: true },
        { icon: '📅', label: '날짜', value: preferredDate },
        { icon: '⏰', label: '시간', value: preferredTime || '오전' },
        { icon: '📍', label: '방문 장소', value: address },
        { icon: '📞', label: '연락처', value: contactPhone }
      ]
    }
  };
};

const handleRegisterEmergencyCare: ToolHandler = async (input, state) => {
  const { serviceType, urgencyLevel, situation, address, contactPhone } = input as {
    serviceType: string;
    urgencyLevel: string;
    situation?: string;
    address: string;
    contactPhone: string;
  };

  const registrationNumber = `EC-${Date.now().toString().slice(-6)}`;

  return {
    result: {
      registrationNumber,
      serviceType,
      status: '접수완료',
      expectedResponse: urgencyLevel === '즉시' ? '2시간 내' : urgencyLevel === '24시간내' ? '24시간 내' : '3일 내'
    },
    stateUpdate: {
      currentStep: 'emergency_care' as const
    },
    displayData: {
      type: 'appointment',
      title: '긴급 돌봄 서비스 신청 완료',
      items: [
        { icon: '🚨', label: '서비스', value: serviceType, highlight: true },
        { icon: '📋', label: '접수번호', value: registrationNumber },
        { icon: '⏱️', label: '예상 응답', value: urgencyLevel === '즉시' ? '2시간 내' : '24시간 내' },
        { icon: '📍', label: '서비스 장소', value: address },
        { icon: '📞', label: '긴급 연락처', value: '129 (복지상담)' }
      ]
    }
  };
};

const handleShareFamilyCalendar: ToolHandler = async (input, state) => {
  const { familyMembers, events, shareMethod } = input as {
    familyMembers: string[];
    events?: string[];
    shareMethod?: string;
  };

  return {
    result: {
      shared: true,
      members: familyMembers,
      method: shareMethod || '카카오톡'
    },
    stateUpdate: {
      currentStep: 'family_calendar' as const
    },
    displayData: {
      type: 'calendar',
      title: '가족 돌봄 캘린더 공유',
      items: [
        { icon: '👨‍👩‍👧‍👦', label: '공유 대상', value: `${familyMembers.length}명`, highlight: true },
        { icon: '📱', label: '공유 방법', value: shareMethod || '카카오톡' },
        ...familyMembers.map(m => ({
          icon: '✅',
          label: '멤버',
          value: m,
          highlight: false
        }))
      ]
    }
  };
};

const handleGetGovernmentDocs: ToolHandler = async (input, state) => {
  const { docType, purpose } = input as {
    docType: string;
    purpose?: string;
  };

  return {
    result: {
      docType,
      status: '발급완료',
      downloadUrl: 'https://gov.kr/download/...',
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    displayData: {
      type: 'document',
      title: '정부서류 발급 완료',
      items: [
        { icon: '📄', label: '서류명', value: docType, highlight: true },
        { icon: '✅', label: '발급 상태', value: '완료' },
        { icon: '🏛️', label: '발급처', value: '정부24' },
        { icon: '📅', label: '유효기간', value: '발급일로부터 90일' }
      ]
    }
  };
};

const handleSummarizeProgress: ToolHandler = async (input, state) => {
  const { includeNextSteps } = input as { includeNextSteps?: boolean };

  const completedItems = [];
  if (state.diagnosis) completedItems.push('돌봄 필요도 진단');
  if (state.appointments?.length) completedItems.push('방문조사 예약');
  if (state.discoveredBenefits?.length) completedItems.push(`복지혜택 ${state.discoveredBenefits.length}건 발굴`);
  if (state.nearbyFacilities?.length) completedItems.push(`요양시설 ${state.nearbyFacilities.length}곳 검색`);

  return {
    result: {
      completedSteps: completedItems,
      currentStep: state.currentStep,
      totalBenefits: state.discoveredBenefits?.length || 0,
      scheduledAppointments: state.appointments?.length || 0
    },
    displayData: {
      type: 'summary',
      title: '상담 진행 현황',
      items: [
        { icon: '📊', label: '완료 항목', value: `${completedItems.length}건`, highlight: true },
        ...completedItems.map(item => ({
          icon: '✅',
          label: item,
          value: '완료',
          highlight: false
        })),
        ...(includeNextSteps ? [{
          icon: '➡️',
          label: '다음 단계',
          value: getNextStepLabel(state.currentStep),
          highlight: true
        }] : [])
      ]
    }
  };
};

const handleGetFacilityDetail: ToolHandler = async (input, state) => {
  const { facilityId, facilityName } = input as {
    facilityId: string;
    facilityName?: string;
  };

  try {
    // API에서 상세 정보 조회
    const detail = await getLtcFacilityDetail(facilityId);

    if (!detail) {
      return {
        result: { error: '시설 상세정보를 찾을 수 없습니다.' },
        displayData: {
          type: 'facilities',
          title: '시설 상세 조회 실패',
          items: [
            { icon: '❌', label: '오류', value: '해당 시설 정보를 찾을 수 없습니다', highlight: true }
          ]
        }
      };
    }

    // 상세 정보 구성
    const facilityDetail = {
      id: detail.longTermAdminSym,
      name: detail.adminNm,
      address: detail.ctprvnAddr,
      phone: detail.adminTelNo,
      homepage: detail.hmpgAddr,
      totalCapacity: detail.totPer,
      currentOccupancy: detail.curPer,
      employeeCount: detail.emplyCnt,
      representative: detail.rprsvNm,
      establishedDate: detail.bsnStartDt,
      programs: detail.prgmInfo ? detail.prgmInfo.split(',').map(p => p.trim()) : []
    };

    // 빈자리 계산
    const availableSlots = facilityDetail.totalCapacity && facilityDetail.currentOccupancy
      ? facilityDetail.totalCapacity - facilityDetail.currentOccupancy
      : null;

    return {
      result: facilityDetail,
      displayData: {
        type: 'facilities',
        title: `📋 ${facilityDetail.name} 상세정보`,
        items: [
          { icon: '🏢', label: '시설명', value: facilityDetail.name, highlight: true },
          { icon: '📍', label: '주소', value: facilityDetail.address || '정보 없음' },
          { icon: '📞', label: '전화번호', value: facilityDetail.phone || '정보 없음' },
          { icon: '👥', label: '정원/현원', value: facilityDetail.totalCapacity
            ? `${facilityDetail.currentOccupancy || 0}/${facilityDetail.totalCapacity}명`
            : '정보 없음' },
          ...(availableSlots !== null ? [{
            icon: '✨',
            label: '빈자리',
            value: availableSlots > 0 ? `${availableSlots}자리 가능` : '만석',
            highlight: availableSlots > 0
          }] : []),
          { icon: '👨‍⚕️', label: '종사자 수', value: facilityDetail.employeeCount
            ? `${facilityDetail.employeeCount}명`
            : '정보 없음' },
          ...(facilityDetail.homepage ? [{
            icon: '🌐',
            label: '홈페이지',
            value: facilityDetail.homepage,
            highlight: false
          }] : [])
        ]
      }
    };

  } catch (error) {
    console.error('시설 상세 조회 오류:', error);
    return {
      result: { error: '시설 상세정보 조회 중 오류가 발생했습니다.' },
      displayData: {
        type: 'facilities',
        title: '시설 상세 조회 오류',
        items: [
          { icon: '❌', label: '오류', value: '조회 중 문제가 발생했습니다', highlight: true }
        ]
      }
    };
  }
};

// ============================================
// Helper Functions
// ============================================

function getRecommendation(grade: CareLevelDiagnosis['estimatedGrade']): string {
  const recommendations: Record<string, string> = {
    '1등급': '시설급여(요양원) 또는 24시간 재가서비스 권장',
    '2등급': '주야간보호 + 방문요양 병행 권장',
    '3등급': '주간보호센터 이용 권장',
    '4등급': '방문요양 서비스 권장',
    '5등급': '방문요양 또는 주간보호 권장',
    '인지지원등급': '치매안심센터 연계 권장',
    '등급외': '노인맞춤돌봄서비스 신청 권장'
  };
  return recommendations[grade] || '전문 상담 권장';
}

function getUrgencyLabel(level: CareLevelDiagnosis['urgencyLevel']): string {
  const labels: Record<string, string> = {
    low: '낮음',
    medium: '보통',
    high: '높음',
    critical: '매우 높음'
  };
  return labels[level] || '보통';
}

function getNextStepLabel(step: string | undefined): string {
  const nextSteps: Record<string, string> = {
    initial: '건강 상태 파악',
    health_assessment: '등급 신청',
    diagnosis: '등급 신청 또는 긴급 돌봄',
    grade_application: '복지혜택 검색',
    emergency_care: '시설 검색',
    benefit_discovery: '요양시설 검색',
    facility_search: '가족 캘린더 설정',
    family_calendar: '상담 완료'
  };
  return nextSteps[step || 'initial'] || '추가 상담';
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// ============================================
// Tool Registry Export
// ============================================

export const CARE_BRIDGE_TOOLS: ClaudeTool[] = [
  diagnoseCareLevel,
  applyLongTermCare,
  searchWelfareBenefits,
  searchCareFacilities,
  getFacilityDetail,
  scheduleVisitSurvey,
  registerEmergencyCare,
  shareFamilyCalendar,
  getGovernmentDocs,
  summarizeProgress
];

export const TOOL_HANDLERS: Record<string, ToolHandler> = {
  diagnose_care_level: handleDiagnoseCareLevel,
  apply_long_term_care: handleApplyLongTermCare,
  search_welfare_benefits: handleSearchWelfareBenefits,
  search_care_facilities: handleSearchCareFacilities,
  get_facility_detail: handleGetFacilityDetail,
  schedule_visit_survey: handleScheduleVisitSurvey,
  register_emergency_care: handleRegisterEmergencyCare,
  share_family_calendar: handleShareFamilyCalendar,
  get_government_docs: handleGetGovernmentDocs,
  summarize_progress: handleSummarizeProgress
};
