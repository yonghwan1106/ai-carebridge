// 요양시설 목업 데이터

import type { CareFacility } from '@/types/care';

export const CARE_FACILITIES: CareFacility[] = [
  // 주간보호센터
  {
    id: 'cf-001',
    name: '강남사랑주간보호센터',
    type: '주간보호센터',
    address: '서울시 강남구 역삼동 123-4',
    distance: 1.2,
    rating: 4.8,
    reviewCount: 156,
    monthlyFee: { min: 400000, max: 600000 },
    specialties: ['치매전문', '물리치료', '인지재활'],
    availableSlots: true,
    phone: '02-1234-5678',
    website: 'https://example.com'
  },
  {
    id: 'cf-002',
    name: '행복한오후주간보호',
    type: '주간보호센터',
    address: '서울시 강남구 삼성동 456-7',
    distance: 2.5,
    rating: 4.6,
    reviewCount: 89,
    monthlyFee: { min: 350000, max: 550000 },
    specialties: ['재활치료', '작업치료', '음악치료'],
    availableSlots: true,
    phone: '02-2345-6789'
  },
  {
    id: 'cf-003',
    name: '푸른솔주간보호센터',
    type: '주간보호센터',
    address: '서울시 서초구 반포동 789-1',
    distance: 3.1,
    rating: 4.5,
    reviewCount: 72,
    monthlyFee: { min: 380000, max: 580000 },
    specialties: ['물리치료', '원예치료'],
    availableSlots: true,
    phone: '02-3456-7890'
  },
  {
    id: 'cf-004',
    name: '효사랑주간보호',
    type: '주간보호센터',
    address: '서울시 송파구 잠실동 111-2',
    distance: 4.2,
    rating: 4.7,
    reviewCount: 134,
    monthlyFee: { min: 400000, max: 620000 },
    specialties: ['치매전문', '인지재활', '미술치료'],
    availableSlots: false,
    phone: '02-4567-8901'
  },
  {
    id: 'cf-005',
    name: '햇살주간보호센터',
    type: '주간보호센터',
    address: '서울시 강동구 천호동 222-3',
    distance: 5.8,
    rating: 4.4,
    reviewCount: 56,
    monthlyFee: { min: 320000, max: 480000 },
    specialties: ['재활치료', '작업치료'],
    availableSlots: true,
    phone: '02-5678-9012'
  },

  // 요양원
  {
    id: 'cf-006',
    name: '강남실버타운',
    type: '요양원',
    address: '서울시 강남구 개포동 333-4',
    distance: 2.8,
    rating: 4.5,
    reviewCount: 203,
    monthlyFee: { min: 2500000, max: 4000000 },
    specialties: ['치매전문', '재활', '24시간 간호'],
    availableSlots: true,
    phone: '02-6789-0123',
    website: 'https://example.com'
  },
  {
    id: 'cf-007',
    name: '서초효도요양원',
    type: '요양원',
    address: '서울시 서초구 양재동 444-5',
    distance: 3.5,
    rating: 4.3,
    reviewCount: 178,
    monthlyFee: { min: 2200000, max: 3500000 },
    specialties: ['중증환자', '재활', '한방진료'],
    availableSlots: true,
    phone: '02-7890-1234'
  },
  {
    id: 'cf-008',
    name: '송파사랑요양원',
    type: '요양원',
    address: '서울시 송파구 문정동 555-6',
    distance: 5.2,
    rating: 4.6,
    reviewCount: 145,
    monthlyFee: { min: 2000000, max: 3200000 },
    specialties: ['치매전문', '물리치료'],
    availableSlots: false,
    phone: '02-8901-2345'
  },
  {
    id: 'cf-009',
    name: '한강실버홈',
    type: '요양원',
    address: '서울시 영등포구 여의도동 666-7',
    distance: 8.5,
    rating: 4.4,
    reviewCount: 112,
    monthlyFee: { min: 1800000, max: 2800000 },
    specialties: ['재활', '작업치료', '호스피스'],
    availableSlots: true,
    phone: '02-9012-3456'
  },
  {
    id: 'cf-010',
    name: '청담효요양원',
    type: '요양원',
    address: '서울시 강남구 청담동 777-8',
    distance: 2.1,
    rating: 4.9,
    reviewCount: 89,
    monthlyFee: { min: 3500000, max: 6000000 },
    specialties: ['VIP케어', '치매전문', '24시간 의료'],
    availableSlots: true,
    phone: '02-0123-4567',
    website: 'https://example.com'
  },

  // 재가서비스
  {
    id: 'cf-011',
    name: '강남방문요양센터',
    type: '재가서비스',
    address: '서울시 강남구 대치동 888-9',
    distance: 1.5,
    rating: 4.7,
    reviewCount: 234,
    monthlyFee: { min: 300000, max: 800000 },
    specialties: ['방문요양', '방문목욕', '방문간호'],
    availableSlots: true,
    phone: '02-1234-0000'
  },
  {
    id: 'cf-012',
    name: '사랑나눔재가센터',
    type: '재가서비스',
    address: '서울시 서초구 서초동 999-1',
    distance: 2.8,
    rating: 4.5,
    reviewCount: 167,
    monthlyFee: { min: 280000, max: 750000 },
    specialties: ['방문요양', '방문목욕', '가사지원'],
    availableSlots: true,
    phone: '02-2345-0000'
  },
  {
    id: 'cf-013',
    name: '효도재가복지센터',
    type: '재가서비스',
    address: '서울시 송파구 가락동 101-2',
    distance: 4.5,
    rating: 4.6,
    reviewCount: 198,
    monthlyFee: { min: 250000, max: 700000 },
    specialties: ['방문요양', '방문간호', '야간보호'],
    availableSlots: true,
    phone: '02-3456-0000'
  },
  {
    id: 'cf-014',
    name: '행복케어재가',
    type: '재가서비스',
    address: '서울시 강동구 길동 202-3',
    distance: 6.2,
    rating: 4.4,
    reviewCount: 89,
    monthlyFee: { min: 220000, max: 650000 },
    specialties: ['방문요양', '방문목욕'],
    availableSlots: true,
    phone: '02-4567-0000'
  },
  {
    id: 'cf-015',
    name: '온누리재가센터',
    type: '재가서비스',
    address: '서울시 강서구 화곡동 303-4',
    distance: 12.5,
    rating: 4.3,
    reviewCount: 76,
    monthlyFee: { min: 200000, max: 600000 },
    specialties: ['방문요양', '가사지원', '이동지원'],
    availableSlots: true,
    phone: '02-5678-0000'
  },

  // 양로원
  {
    id: 'cf-016',
    name: '강남행복양로원',
    type: '양로원',
    address: '서울시 강남구 논현동 404-5',
    distance: 2.3,
    rating: 4.2,
    reviewCount: 45,
    monthlyFee: { min: 800000, max: 1500000 },
    specialties: ['건강관리', '여가프로그램'],
    availableSlots: true,
    phone: '02-6789-0000'
  },
  {
    id: 'cf-017',
    name: '서초실버양로원',
    type: '양로원',
    address: '서울시 서초구 방배동 505-6',
    distance: 4.1,
    rating: 4.4,
    reviewCount: 67,
    monthlyFee: { min: 700000, max: 1300000 },
    specialties: ['건강관리', '사회활동', '취미활동'],
    availableSlots: true,
    phone: '02-7890-0000'
  },

  // 요양병원
  {
    id: 'cf-018',
    name: '강남효요양병원',
    type: '요양병원',
    address: '서울시 강남구 수서동 606-7',
    distance: 3.8,
    rating: 4.5,
    reviewCount: 312,
    monthlyFee: { min: 1500000, max: 3000000 },
    specialties: ['중증환자', '재활의료', '호스피스'],
    availableSlots: true,
    phone: '02-8901-0000',
    website: 'https://example.com'
  },
  {
    id: 'cf-019',
    name: '서울남부요양병원',
    type: '요양병원',
    address: '서울시 관악구 신림동 707-8',
    distance: 9.5,
    rating: 4.3,
    reviewCount: 278,
    monthlyFee: { min: 1200000, max: 2500000 },
    specialties: ['재활의료', '치매치료', '한방치료'],
    availableSlots: true,
    phone: '02-9012-0000'
  },
  {
    id: 'cf-020',
    name: '강동사랑요양병원',
    type: '요양병원',
    address: '서울시 강동구 암사동 808-9',
    distance: 7.2,
    rating: 4.6,
    reviewCount: 189,
    monthlyFee: { min: 1400000, max: 2800000 },
    specialties: ['중증환자', '재활', '투석'],
    availableSlots: false,
    phone: '02-0123-0000'
  }
];

// 시설 유형별 그룹화
export function getFacilitiesByType() {
  const grouped: Record<string, CareFacility[]> = {};
  CARE_FACILITIES.forEach(facility => {
    if (!grouped[facility.type]) {
      grouped[facility.type] = [];
    }
    grouped[facility.type].push(facility);
  });
  return grouped;
}

// 거리순 정렬
export function sortByDistance(facilities: CareFacility[]): CareFacility[] {
  return [...facilities].sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

// 평점순 정렬
export function sortByRating(facilities: CareFacility[]): CareFacility[] {
  return [...facilities].sort((a, b) => b.rating - a.rating);
}

// 예산 내 필터링
export function filterByBudget(facilities: CareFacility[], maxBudget: number): CareFacility[] {
  return facilities.filter(f => f.monthlyFee.min <= maxBudget);
}

// 특화 서비스로 필터링
export function filterBySpecialty(facilities: CareFacility[], specialty: string): CareFacility[] {
  return facilities.filter(f => f.specialties.some(s => s.includes(specialty)));
}
