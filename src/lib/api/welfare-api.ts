// 복지로 복지서비스 API 연동
// 중앙부처복지서비스: https://www.data.go.kr/data/15090532/openapi.do
// 지자체복지서비스: https://www.data.go.kr/data/15108347/openapi.do

import type { WelfareBenefit } from '@/types/care';

// API 응답 타입 정의
interface WelfareServiceResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: WelfareServiceItem[] | WelfareServiceItem;
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

interface WelfareServiceItem {
  servId: string;           // 서비스ID
  servNm: string;           // 서비스명
  servDgst: string;         // 서비스요약
  jurMnofNm?: string;       // 소관부처명
  jurOrgNm?: string;        // 소관조직명
  trgterIndvdlNm?: string;  // 지원대상
  slctCritNm?: string;      // 선정기준
  alwServCn?: string;       // 급여서비스내용
  applmetNm?: string;       // 신청방법
  applUrl?: string;         // 신청URL
  inqplCtadrList?: string;  // 문의처
  servDtlLink?: string;     // 상세링크
  ctpvNm?: string;          // 시도명 (지자체)
  sggNm?: string;           // 시군구명 (지자체)
  lifeNmArray?: string;     // 생애주기
  intrsThemaNmArray?: string; // 관심주제
  lastModYmd?: string;      // 최종수정일
}

// 생애주기 코드 매핑
const LIFE_CYCLE_CODES: Record<string, string> = {
  '영유아': '001',
  '아동': '002',
  '청소년': '003',
  '청년': '004',
  '중장년': '005',
  '노년': '006',
  '전체': ''
};

// 관심주제 코드 매핑 (노인 돌봄 관련)
const INTEREST_THEME_CODES: Record<string, string[]> = {
  '돌봄': ['BL0001', 'BL0005'],  // 돌봄, 신체건강
  '의료': ['BL0005', 'BL0006'],  // 신체건강, 정신건강
  '소득': ['BL0002'],            // 생활지원
  '주거': ['BL0003'],            // 주거
  '일자리': ['BL0004']           // 일자리
};

/**
 * 중앙부처 복지서비스 검색
 */
export async function searchCentralWelfareServices(params: {
  lifeNm?: string;           // 생애주기 (노년, 중장년 등)
  intrsThemaNm?: string;     // 관심주제 (돌봄, 의료, 소득 등)
  searchWrd?: string;        // 검색어
  pageNo?: number;
  numOfRows?: number;
}): Promise<{ services: WelfareServiceItem[]; totalCount: number }> {
  const apiKey = process.env.PUBLIC_DATA_API_KEY;

  if (!apiKey) {
    console.warn('PUBLIC_DATA_API_KEY가 설정되지 않았습니다.');
    return { services: [], totalCount: 0 };
  }

  const { lifeNm, intrsThemaNm, searchWrd, pageNo = 1, numOfRows = 20 } = params;

  const queryParams = new URLSearchParams({
    serviceKey: apiKey,
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
    _type: 'json'
  });

  // 생애주기 필터
  if (lifeNm && LIFE_CYCLE_CODES[lifeNm]) {
    queryParams.append('lifeNmArray', lifeNm);
  }

  // 검색어
  if (searchWrd) {
    queryParams.append('searchWrd', searchWrd);
  }

  try {
    const url = `http://apis.data.go.kr/B554287/NationalWelfareInformationService/NationalWelfareInformationServiceList?${queryParams.toString()}`;
    console.log('중앙부처 복지서비스 API 호출:', url.replace(apiKey, 'API_KEY'));

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }

    const data = await response.json();

    // 응답 구조 확인
    if (!data.response?.body?.items?.item) {
      return { services: [], totalCount: 0 };
    }

    const items = data.response.body.items.item;
    const itemArray = Array.isArray(items) ? items : [items];

    return {
      services: itemArray,
      totalCount: data.response.body.totalCount || itemArray.length
    };

  } catch (error) {
    console.error('중앙부처 복지서비스 API 오류:', error);
    throw error;
  }
}

/**
 * 지자체 복지서비스 검색
 */
export async function searchLocalWelfareServices(params: {
  ctpvNm?: string;           // 시도명
  sggNm?: string;            // 시군구명
  searchWrd?: string;        // 검색어
  pageNo?: number;
  numOfRows?: number;
}): Promise<{ services: WelfareServiceItem[]; totalCount: number }> {
  const apiKey = process.env.PUBLIC_DATA_API_KEY;

  if (!apiKey) {
    return { services: [], totalCount: 0 };
  }

  const { ctpvNm, sggNm, searchWrd, pageNo = 1, numOfRows = 10 } = params;

  const queryParams = new URLSearchParams({
    serviceKey: apiKey,
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
    _type: 'json'
  });

  if (ctpvNm) {
    queryParams.append('ctpvNm', ctpvNm);
  }
  if (sggNm) {
    queryParams.append('sggNm', sggNm);
  }
  if (searchWrd) {
    queryParams.append('searchWrd', searchWrd);
  }

  try {
    const url = `http://apis.data.go.kr/B554287/LocalGovernmentWelfareInformationService/LcgvWelfarelist?${queryParams.toString()}`;
    console.log('지자체 복지서비스 API 호출:', url.replace(apiKey, 'API_KEY'));

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }

    const data = await response.json();

    if (!data.response?.body?.items?.item) {
      return { services: [], totalCount: 0 };
    }

    const items = data.response.body.items.item;
    const itemArray = Array.isArray(items) ? items : [items];

    return {
      services: itemArray,
      totalCount: data.response.body.totalCount || itemArray.length
    };

  } catch (error) {
    console.error('지자체 복지서비스 API 오류:', error);
    throw error;
  }
}

/**
 * 통합 복지서비스 검색 (중앙부처 + 지자체)
 */
export async function searchWelfareServices(params: {
  age?: number;
  region?: string;
  conditions?: string[];
  incomeLevel?: string;
}): Promise<{ benefits: WelfareBenefit[]; totalCount: number; isRealData: boolean }> {
  const { age, region, conditions = [], incomeLevel } = params;

  let allServices: WelfareServiceItem[] = [];
  let totalCount = 0;
  let isRealData = false;

  // 검색 키워드 구성
  const searchKeywords: string[] = [];
  if (age && age >= 65) {
    searchKeywords.push('노인', '어르신', '장기요양');
  }
  if (conditions.includes('치매')) {
    searchKeywords.push('치매');
  }
  if (conditions.includes('독거')) {
    searchKeywords.push('독거', '돌봄');
  }
  if (incomeLevel === 'low') {
    searchKeywords.push('기초', '저소득');
  }

  try {
    // 1. 중앙부처 복지서비스 검색 (노인/어르신 키워드)
    const centralResult = await searchCentralWelfareServices({
      lifeNm: age && age >= 65 ? '노년' : undefined,
      searchWrd: searchKeywords[0] || '노인',
      numOfRows: 15
    });

    if (centralResult.services.length > 0) {
      allServices = [...centralResult.services];
      totalCount += centralResult.totalCount;
      isRealData = true;
    }

    // 2. 지자체 복지서비스 검색 (지역 기반)
    if (region) {
      const sidoNm = extractSidoName(region);
      if (sidoNm) {
        const localResult = await searchLocalWelfareServices({
          ctpvNm: sidoNm,
          searchWrd: '노인',
          numOfRows: 10
        });

        if (localResult.services.length > 0) {
          allServices = [...allServices, ...localResult.services];
          totalCount += localResult.totalCount;
          isRealData = true;
        }
      }
    }

  } catch (error) {
    console.error('복지서비스 검색 오류:', error);
  }

  // WelfareBenefit 형식으로 변환
  const benefits: WelfareBenefit[] = allServices.slice(0, 10).map((svc, idx) => ({
    id: svc.servId || `welfare-${idx}`,
    name: svc.servNm,
    category: inferCategory(svc),
    description: svc.servDgst || svc.alwServCn || '',
    eligibility: parseEligibility(svc.trgterIndvdlNm, svc.slctCritNm),
    monthlyAmount: estimateAmount(svc),
    applicationUrl: svc.applUrl || svc.servDtlLink,
    agency: svc.jurMnofNm || svc.jurOrgNm || '관할 지자체',
    phone: svc.inqplCtadrList?.split(',')[0]?.trim()
  }));

  return { benefits, totalCount, isRealData };
}

// 헬퍼 함수들

function extractSidoName(region: string): string | undefined {
  const sidoList = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ];

  for (const sido of sidoList) {
    if (region.includes(sido)) {
      // API에서는 "서울특별시" 형태로 검색해야 할 수 있음
      if (sido === '서울') return '서울특별시';
      if (sido === '부산') return '부산광역시';
      if (sido === '대구') return '대구광역시';
      if (sido === '인천') return '인천광역시';
      if (sido === '광주') return '광주광역시';
      if (sido === '대전') return '대전광역시';
      if (sido === '울산') return '울산광역시';
      if (sido === '세종') return '세종특별자치시';
      if (sido === '경기') return '경기도';
      if (sido === '강원') return '강원특별자치도';
      if (sido === '충북') return '충청북도';
      if (sido === '충남') return '충청남도';
      if (sido === '전북') return '전북특별자치도';
      if (sido === '전남') return '전라남도';
      if (sido === '경북') return '경상북도';
      if (sido === '경남') return '경상남도';
      if (sido === '제주') return '제주특별자치도';
    }
  }
  return undefined;
}

function inferCategory(svc: WelfareServiceItem): WelfareBenefit['category'] {
  const text = `${svc.servNm} ${svc.servDgst || ''} ${svc.intrsThemaNmArray || ''}`.toLowerCase();

  if (text.includes('돌봄') || text.includes('요양') || text.includes('간병')) {
    return '돌봄서비스';
  }
  if (text.includes('의료') || text.includes('건강') || text.includes('병원') || text.includes('치료')) {
    return '의료지원';
  }
  if (text.includes('주거') || text.includes('주택') || text.includes('임대')) {
    return '주거지원';
  }
  if (text.includes('교통') || text.includes('이동')) {
    return '교통지원';
  }
  if (text.includes('급여') || text.includes('수당') || text.includes('지원금') || text.includes('연금')) {
    return '소득지원';
  }
  return '기타';
}

function parseEligibility(trgterIndvdlNm?: string, slctCritNm?: string): string[] {
  const eligibility: string[] = [];

  if (trgterIndvdlNm) {
    // "노인, 장애인, 저소득층" 형태 파싱
    const targets = trgterIndvdlNm.split(/[,;·]/);
    eligibility.push(...targets.map(t => t.trim()).filter(t => t));
  }

  if (slctCritNm && eligibility.length < 3) {
    eligibility.push(slctCritNm.substring(0, 50) + (slctCritNm.length > 50 ? '...' : ''));
  }

  return eligibility.slice(0, 3);
}

function estimateAmount(svc: WelfareServiceItem): number | undefined {
  const text = `${svc.servNm} ${svc.alwServCn || ''}`;

  // 금액 패턴 매칭 시도
  const patterns = [
    /(\d{1,3}(?:,\d{3})*)\s*원/g,
    /월\s*(\d+)\s*만\s*원/g,
    /(\d+)\s*만\s*원/g
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseInt(numStr);
      // 만원 단위인 경우
      if (text.includes('만원') || text.includes('만 원')) {
        return num * 10000;
      }
      // 이미 원 단위인 경우
      if (num > 10000) {
        return num;
      }
    }
  }

  // 서비스 유형별 추정
  if (text.includes('기초연금')) return 334000;
  if (text.includes('장기요양')) return 500000;
  if (text.includes('돌봄')) return 300000;

  return undefined;
}
