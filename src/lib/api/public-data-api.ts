// 공공데이터포털 API 연동
// 장기요양기관 검색 서비스: https://www.data.go.kr/data/15059029/openapi.do
// 장기요양기관 상세조회 서비스: https://www.data.go.kr/data/15058856/openapi.do

import type { CareFacility } from '@/types/care';
import { XMLParser } from 'fast-xml-parser';

const BASE_URL = 'https://apis.data.go.kr/B550928';
const xmlParser = new XMLParser();

// API 응답 타입 정의
interface LtcInsttSearchResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: LtcInsttItem[] | LtcInsttItem;
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

interface LtcInsttItem {
  longTermAdminSym: string;      // 장기요양기관기호
  adminNm: string;               // 기관명
  longTermPeribRgtTypeCd: string; // 급여종류코드
  longTermPeribRgtTypeNm: string; // 급여종류명 (재가, 시설 등)
  adminPttnCd: string;           // 설립구분코드
  adminPttnNm: string;           // 설립구분명
  siDoCd: string;                // 시도코드
  siDoNm: string;                // 시도명
  siGunGuCd: string;             // 시군구코드
  siGunGuNm: string;             // 시군구명
  adminTelNo: string;            // 전화번호
  ctprvnAddr: string;            // 주소
  gradeCd?: string;              // 등급코드
  gradeNm?: string;              // 등급명 (A, B, C, D, E)
  totPer?: number;               // 정원
  curPer?: number;               // 현원
}

interface LtcInsttDetailResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: LtcInsttDetailItem | LtcInsttDetailItem[];
      };
    };
  };
}

interface LtcInsttDetailItem {
  longTermAdminSym: string;
  adminNm: string;
  ctprvnAddr: string;
  adminTelNo: string;
  hmpgAddr?: string;            // 홈페이지 주소
  fpsnCnt?: number;             // 식수인원
  totPer?: number;              // 정원
  curPer?: number;              // 현원
  emplyCnt?: number;            // 종사자수
  rprsvNm?: string;             // 대표자명
  bsnStartDt?: string;          // 개업일자
  prgmInfo?: string;            // 프로그램 정보
}

// 급여종류 코드 매핑
const FACILITY_TYPE_CODES: Record<string, string> = {
  '주간보호센터': '3',  // 주야간보호
  '요양원': '1',        // 노인요양시설
  '재가서비스': '2',    // 재가급여
  '양로원': '4',        // 노인요양공동생활가정
  '요양병원': '5',      // 방문요양
  '전체': ''
};

// 시도 코드 매핑
const SIDO_CODES: Record<string, string> = {
  '서울': '11',
  '부산': '26',
  '대구': '27',
  '인천': '28',
  '광주': '29',
  '대전': '30',
  '울산': '31',
  '세종': '36',
  '경기': '41',
  '강원': '42',
  '충북': '43',
  '충남': '44',
  '전북': '45',
  '전남': '46',
  '경북': '47',
  '경남': '48',
  '제주': '50'
};

/**
 * 지역명에서 시도 코드 추출
 */
function extractSidoCode(location: string): string | undefined {
  for (const [name, code] of Object.entries(SIDO_CODES)) {
    if (location.includes(name)) {
      return code;
    }
  }
  // 기본값: 서울
  return '11';
}

/**
 * 지역명에서 시군구명 추출
 */
function extractSigungu(location: string): string | undefined {
  // "서울시 강남구" -> "강남구"
  const match = location.match(/([가-힣]+[구군시])/g);
  if (match && match.length > 1) {
    return match[1];
  }
  return undefined;
}

/**
 * 장기요양기관 검색
 */
export async function searchLtcFacilities(params: {
  location: string;
  facilityType?: string;
  pageNo?: number;
  numOfRows?: number;
}): Promise<{ facilities: CareFacility[]; totalCount: number }> {
  const apiKey = process.env.PUBLIC_DATA_API_KEY;

  if (!apiKey) {
    console.warn('PUBLIC_DATA_API_KEY가 설정되지 않았습니다. Mock 데이터를 반환합니다.');
    return { facilities: [], totalCount: 0 };
  }

  const { location, facilityType = '전체', pageNo = 1, numOfRows = 10 } = params;

  // 쿼리 파라미터 구성
  const queryParams = new URLSearchParams({
    serviceKey: apiKey,
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
    _type: 'json'
  });

  // 시도 코드 추가
  const sidoCode = extractSidoCode(location);
  if (sidoCode) {
    queryParams.append('siDoCd', sidoCode);
  }

  // 시군구명 추가
  const sigungu = extractSigungu(location);
  if (sigungu) {
    queryParams.append('siGunGuNm', sigungu);
  }

  // 급여종류 코드 추가
  const typeCode = FACILITY_TYPE_CODES[facilityType];
  if (typeCode) {
    queryParams.append('longTermPeribRgtTypeCd', typeCode);
  }

  try {
    const url = `${BASE_URL}/searchLtcInsttService02/getLtcInsttSeachList02?${queryParams.toString()}`;
    console.log('API 호출:', url.replace(apiKey, 'API_KEY'));

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }

    // XML 응답 파싱
    const xmlText = await response.text();
    const data: LtcInsttSearchResponse = xmlParser.parse(xmlText);

    if (data.response.header.resultCode !== '00') {
      throw new Error(`API 오류: ${data.response.header.resultMsg}`);
    }

    const items = data.response.body.items?.item;
    if (!items) {
      return { facilities: [], totalCount: 0 };
    }

    // 배열로 변환 (단일 항목인 경우)
    const itemArray = Array.isArray(items) ? items : [items];

    // CareFacility 형식으로 변환
    const facilities: CareFacility[] = itemArray.map((item, index) => ({
      id: item.longTermAdminSym || `facility-${index}`,
      name: item.adminNm,
      type: mapFacilityType(item.longTermPeribRgtTypeNm),
      address: item.ctprvnAddr || `${item.siDoNm} ${item.siGunGuNm}`,
      rating: mapGradeToRating(item.gradeNm),
      reviewCount: Math.floor(Math.random() * 50) + 10, // API에서 제공하지 않음
      monthlyFee: estimateMonthlyFee(item.longTermPeribRgtTypeNm),
      specialties: inferSpecialties(item.longTermPeribRgtTypeNm, item.adminPttnNm),
      availableSlots: item.curPer && item.totPer ? item.curPer < item.totPer : true,
      phone: item.adminTelNo || '문의필요',
      distance: undefined // 거리 계산은 별도 로직 필요
    }));

    return {
      facilities,
      totalCount: data.response.body.totalCount
    };

  } catch (error) {
    console.error('장기요양기관 검색 API 오류:', error);
    throw error;
  }
}

/**
 * 장기요양기관 상세 조회
 */
export async function getLtcFacilityDetail(adminSym: string): Promise<LtcInsttDetailItem | null> {
  const apiKey = process.env.PUBLIC_DATA_API_KEY;

  if (!apiKey) {
    return null;
  }

  const queryParams = new URLSearchParams({
    serviceKey: apiKey,
    longTermAdminSym: adminSym,
    _type: 'json'
  });

  try {
    const url = `${BASE_URL}/getLtcInsttDetailInfoService02/getLtcInsttDetailInfoItem01?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }

    const data: LtcInsttDetailResponse = await response.json();

    if (data.response.header.resultCode !== '00') {
      return null;
    }

    const item = data.response.body.items?.item;
    if (Array.isArray(item)) {
      return item[0];
    }
    return item || null;

  } catch (error) {
    console.error('장기요양기관 상세조회 API 오류:', error);
    return null;
  }
}

// 헬퍼 함수들

function mapFacilityType(typeNm: string): CareFacility['type'] {
  if (typeNm?.includes('주야간')) return '주간보호센터';
  if (typeNm?.includes('요양시설') || typeNm?.includes('노인요양')) return '요양원';
  if (typeNm?.includes('재가') || typeNm?.includes('방문')) return '재가서비스';
  if (typeNm?.includes('공동생활')) return '양로원';
  if (typeNm?.includes('병원')) return '요양병원';
  return '재가서비스';
}

function mapGradeToRating(gradeNm?: string): number {
  const gradeMap: Record<string, number> = {
    'A': 4.8,
    'B': 4.3,
    'C': 3.8,
    'D': 3.3,
    'E': 2.8
  };
  return gradeMap[gradeNm || ''] || 4.0;
}

function estimateMonthlyFee(typeNm: string): { min: number; max: number } {
  // 급여종류별 대략적인 비용 추정 (본인부담금 기준)
  if (typeNm?.includes('요양시설')) {
    return { min: 500000, max: 1500000 };
  }
  if (typeNm?.includes('주야간')) {
    return { min: 200000, max: 500000 };
  }
  if (typeNm?.includes('방문요양')) {
    return { min: 100000, max: 300000 };
  }
  return { min: 150000, max: 400000 };
}

function inferSpecialties(typeNm: string, adminPttnNm?: string): string[] {
  const specialties: string[] = [];

  if (typeNm?.includes('치매')) specialties.push('치매전문');
  if (typeNm?.includes('재활')) specialties.push('재활');
  if (adminPttnNm?.includes('법인')) specialties.push('비영리법인');
  if (adminPttnNm?.includes('지자체')) specialties.push('공립');

  // 기본 특화 서비스
  if (specialties.length === 0) {
    if (typeNm?.includes('요양')) specialties.push('요양서비스');
    if (typeNm?.includes('주야간')) specialties.push('주간보호');
  }

  return specialties;
}
