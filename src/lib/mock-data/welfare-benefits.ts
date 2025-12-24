// 복지 혜택 목업 데이터

import type { WelfareBenefit } from '@/types/care';

export const WELFARE_BENEFITS: WelfareBenefit[] = [
  // 소득지원
  {
    id: 'bf-001',
    name: '기초연금',
    category: '소득지원',
    description: '65세 이상 소득하위 70% 어르신에게 매월 지급되는 연금',
    eligibility: ['65세 이상', '소득하위 70%'],
    monthlyAmount: 334810,
    applicationUrl: 'https://basicpension.mohw.go.kr',
    agency: '보건복지부',
    phone: '129'
  },
  {
    id: 'bf-002',
    name: '노령연금',
    category: '소득지원',
    description: '국민연금 가입 기간이 10년 이상인 분에게 지급',
    eligibility: ['국민연금 10년 이상 가입', '만 60세 이상'],
    monthlyAmount: 600000,
    applicationUrl: 'https://nps.or.kr',
    agency: '국민연금공단',
    phone: '1355'
  },
  {
    id: 'bf-003',
    name: '장애인연금',
    category: '소득지원',
    description: '중증장애인의 생활안정 지원',
    eligibility: ['중증장애인', '18세 이상', '소득하위 70%'],
    monthlyAmount: 403180,
    applicationUrl: 'https://bokjiro.go.kr',
    agency: '보건복지부',
    phone: '129'
  },

  // 돌봄서비스
  {
    id: 'bf-004',
    name: '노인맞춤돌봄서비스',
    category: '돌봄서비스',
    description: '일상생활 지원이 필요한 어르신에게 안전확인, 생활지원 등 제공',
    eligibility: ['65세 이상', '장기요양등급외 또는 미신청자', '독거 또는 돌봄 필요'],
    applicationUrl: 'https://129.go.kr',
    agency: '지자체',
    phone: '129'
  },
  {
    id: 'bf-005',
    name: '돌봄SOS센터',
    category: '돌봄서비스',
    description: '위기상황 시 긴급돌봄, 일시재가, 동행서비스 등 제공',
    eligibility: ['돌봄 사각지대 어르신', '긴급 돌봄 필요'],
    applicationUrl: 'https://129.go.kr',
    agency: '지자체',
    phone: '129'
  },
  {
    id: 'bf-006',
    name: '장기요양 재가급여',
    category: '돌봄서비스',
    description: '방문요양, 방문목욕, 방문간호, 주야간보호 등',
    eligibility: ['장기요양등급 판정자', '1~5등급 또는 인지지원등급'],
    monthlyAmount: 1800000,
    applicationUrl: 'https://longtermcare.or.kr',
    agency: '국민건강보험공단',
    phone: '1577-1000'
  },
  {
    id: 'bf-007',
    name: '치매안심센터',
    category: '돌봄서비스',
    description: '치매 조기검진, 치매케어서비스, 가족지원 프로그램',
    eligibility: ['60세 이상', '치매 의심 또는 확진'],
    applicationUrl: 'https://nid.or.kr',
    agency: '지자체',
    phone: '1899-9988'
  },

  // 의료지원
  {
    id: 'bf-008',
    name: '노인 틀니 지원',
    category: '의료지원',
    description: '완전틀니, 부분틀니 건강보험 적용',
    eligibility: ['65세 이상', '건강보험 가입자'],
    applicationUrl: 'https://nhis.or.kr',
    agency: '국민건강보험공단',
    phone: '1577-1000'
  },
  {
    id: 'bf-009',
    name: '노인 임플란트 지원',
    category: '의료지원',
    description: '평생 2개까지 임플란트 건강보험 적용 (본인부담 30%)',
    eligibility: ['65세 이상', '건강보험 가입자'],
    applicationUrl: 'https://nhis.or.kr',
    agency: '국민건강보험공단',
    phone: '1577-1000'
  },
  {
    id: 'bf-010',
    name: '노인 안검진 지원',
    category: '의료지원',
    description: '안질환 조기발견을 위한 무료 안검진',
    eligibility: ['65세 이상'],
    applicationUrl: 'https://nhis.or.kr',
    agency: '국민건강보험공단',
    phone: '1577-1000'
  },
  {
    id: 'bf-011',
    name: '본인부담상한제',
    category: '의료지원',
    description: '연간 본인부담금이 상한액 초과 시 환급',
    eligibility: ['건강보험 가입자'],
    applicationUrl: 'https://nhis.or.kr',
    agency: '국민건강보험공단',
    phone: '1577-1000'
  },

  // 주거지원
  {
    id: 'bf-012',
    name: '주거급여',
    category: '주거지원',
    description: '저소득층 주거비 지원 (월세, 수선비)',
    eligibility: ['기준중위소득 48% 이하'],
    monthlyAmount: 350000,
    applicationUrl: 'https://bokjiro.go.kr',
    agency: '국토교통부',
    phone: '1600-0777'
  },
  {
    id: 'bf-013',
    name: '주택 수선 지원',
    category: '주거지원',
    description: '고령자 주택 개보수 지원 (화장실, 경사로 등)',
    eligibility: ['65세 이상', '저소득 가구'],
    applicationUrl: 'https://bokjiro.go.kr',
    agency: '지자체',
    phone: '129'
  },

  // 교통지원
  {
    id: 'bf-014',
    name: '교통비 지원',
    category: '교통지원',
    description: '65세 이상 어르신 대중교통 무료 또는 할인',
    eligibility: ['65세 이상'],
    agency: '지자체',
    phone: '120'
  },
  {
    id: 'bf-015',
    name: '이동지원서비스',
    category: '교통지원',
    description: '거동불편 어르신을 위한 이동 지원 (병원, 관공서)',
    eligibility: ['65세 이상', '거동불편'],
    applicationUrl: 'https://bokjiro.go.kr',
    agency: '지자체',
    phone: '129'
  },

  // 기타
  {
    id: 'bf-016',
    name: '경로식당/무료급식',
    category: '기타',
    description: '저소득 어르신에게 무료 식사 제공',
    eligibility: ['60세 이상', '저소득 또는 독거'],
    agency: '지자체/복지관',
    phone: '129'
  },
  {
    id: 'bf-017',
    name: '도시가스 요금 할인',
    category: '기타',
    description: '저소득 가구 도시가스 요금 할인',
    eligibility: ['기초생활수급자', '차상위계층'],
    agency: '한국가스공사',
    phone: '1544-1211'
  },
  {
    id: 'bf-018',
    name: '전기요금 할인',
    category: '기타',
    description: '저소득 가구 전기요금 할인',
    eligibility: ['기초생활수급자', '차상위계층', '장애인'],
    agency: '한국전력공사',
    phone: '123'
  },
  {
    id: 'bf-019',
    name: '통신요금 할인',
    category: '기타',
    description: '기초생활수급자 통신요금 감면',
    eligibility: ['기초생활수급자'],
    agency: '통신사',
    phone: '114'
  },
  {
    id: 'bf-020',
    name: '문화누리카드',
    category: '기타',
    description: '저소득층 문화예술 향유 지원 (연 11만원)',
    eligibility: ['기초생활수급자', '차상위계층'],
    monthlyAmount: 110000,
    applicationUrl: 'https://munhwa.or.kr',
    agency: '한국문화예술위원회',
    phone: '1544-3412'
  },

  // 긴급지원
  {
    id: 'bf-021',
    name: '긴급복지지원',
    category: '돌봄서비스',
    description: '위기상황 발생 시 긴급 생계비, 의료비, 주거비 지원',
    eligibility: ['위기상황 발생', '소득하위 75%'],
    applicationUrl: 'https://bokjiro.go.kr',
    agency: '보건복지부',
    phone: '129'
  },
  {
    id: 'bf-022',
    name: '노인일자리',
    category: '기타',
    description: '어르신 사회참여 및 소득 지원 (월 27만원 내외)',
    eligibility: ['65세 이상', '근로 가능'],
    monthlyAmount: 270000,
    applicationUrl: 'https://seniorro.or.kr',
    agency: '한국노인인력개발원',
    phone: '1644-0690'
  },
  {
    id: 'bf-023',
    name: '희망키움통장',
    category: '소득지원',
    description: '저소득층 자산형성 지원 (정부 매칭 저축)',
    eligibility: ['기초생활수급자', '차상위계층'],
    applicationUrl: 'https://bokjiro.go.kr',
    agency: '보건복지부',
    phone: '129'
  },
  {
    id: 'bf-024',
    name: '장례비 지원',
    category: '기타',
    description: '저소득 가구 장례비용 지원',
    eligibility: ['기초생활수급자', '차상위계층'],
    monthlyAmount: 800000,
    agency: '지자체',
    phone: '129'
  },
  {
    id: 'bf-025',
    name: '가족요양비',
    category: '돌봄서비스',
    description: '가족이 장기요양 수급자를 돌볼 경우 현금 지원',
    eligibility: ['장기요양등급 판정자', '도서벽지 거주 등'],
    monthlyAmount: 150000,
    applicationUrl: 'https://longtermcare.or.kr',
    agency: '국민건강보험공단',
    phone: '1577-1000'
  }
];

// 카테고리별 그룹화 함수
export function getBenefitsByCategory() {
  const grouped: Record<string, WelfareBenefit[]> = {};
  WELFARE_BENEFITS.forEach(benefit => {
    if (!grouped[benefit.category]) {
      grouped[benefit.category] = [];
    }
    grouped[benefit.category].push(benefit);
  });
  return grouped;
}

// 월 예상 수령액 계산
export function estimateMonthlyBenefits(benefits: WelfareBenefit[]): number {
  return benefits
    .filter(b => b.monthlyAmount)
    .reduce((sum, b) => sum + (b.monthlyAmount || 0), 0);
}
