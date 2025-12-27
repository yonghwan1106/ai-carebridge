import { NextResponse } from 'next/server';
import { searchLtcFacilities, getLtcFacilityDetail } from '@/lib/api/public-data-api';
import { CARE_FACILITIES } from '@/lib/mock-data/care-facilities';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location, facilityType, query, facilityId, pageNo = 1, numOfRows = 20 } = body;

    // 특정 시설 상세 조회
    if (facilityId) {
      const detail = await getLtcFacilityDetail(facilityId);
      if (detail) {
        return NextResponse.json({ detail });
      }
      return NextResponse.json({ error: '시설을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 시설 목록 검색
    try {
      const result = await searchLtcFacilities({
        location: location || '서울',
        facilityType: facilityType || '전체',
        pageNo,
        numOfRows
      });

      // API 결과가 있으면 반환
      if (result.facilities.length > 0) {
        return NextResponse.json({
          facilities: result.facilities,
          totalCount: result.totalCount,
          isRealData: true,
          dataSource: '공공데이터포털 (국민건강보험공단)'
        });
      }

      // API 결과가 없으면 Mock 데이터로 폴백
      throw new Error('API 결과 없음, Mock 데이터 사용');

    } catch (apiError) {
      console.log('API 호출 실패 또는 결과 없음, Mock 데이터 반환');

      // Mock 데이터 폴백
      let mockFacilities = [...CARE_FACILITIES];

      if (facilityType && facilityType !== '전체') {
        mockFacilities = mockFacilities.filter(f => f.type === facilityType);
      }

      if (query) {
        mockFacilities = mockFacilities.filter(f =>
          f.name.includes(query) || f.address.includes(query)
        );
      }

      return NextResponse.json({
        facilities: mockFacilities,
        totalCount: mockFacilities.length,
        isRealData: false,
        dataSource: '샘플 데이터'
      });
    }

  } catch (error) {
    console.error('시설 검색 API 오류:', error);
    return NextResponse.json(
      { error: '시설 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const facilityId = searchParams.get('id');
  const location = searchParams.get('location') || '서울';
  const facilityType = searchParams.get('type') || '전체';
  const pageNo = parseInt(searchParams.get('page') || '1');
  const numOfRows = parseInt(searchParams.get('limit') || '20');

  // 특정 시설 상세 조회
  if (facilityId) {
    try {
      const detail = await getLtcFacilityDetail(facilityId);
      if (detail) {
        return NextResponse.json({ detail });
      }
      return NextResponse.json({ error: '시설을 찾을 수 없습니다.' }, { status: 404 });
    } catch (error) {
      console.error('시설 상세 조회 오류:', error);
      return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
    }
  }

  // 시설 목록 검색 - 실제 API 호출
  try {
    const result = await searchLtcFacilities({
      location,
      facilityType,
      pageNo,
      numOfRows
    });

    // API 결과가 있으면 반환
    if (result.facilities.length > 0) {
      return NextResponse.json({
        facilities: result.facilities,
        totalCount: result.totalCount,
        isRealData: true,
        dataSource: '공공데이터포털 (국민건강보험공단)'
      });
    }

    // API 결과가 없으면 Mock 데이터로 폴백
    throw new Error('API 결과 없음');

  } catch (apiError) {
    const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
    console.log('[Facilities API] API 호출 실패:', errorMessage);

    // Mock 데이터 폴백
    let mockFacilities = [...CARE_FACILITIES];

    if (facilityType && facilityType !== '전체') {
      mockFacilities = mockFacilities.filter(f => f.type === facilityType);
    }

    return NextResponse.json({
      facilities: mockFacilities,
      totalCount: mockFacilities.length,
      isRealData: false,
      dataSource: '샘플 데이터',
      debug: {
        apiKeyExists: !!process.env.PUBLIC_DATA_API_KEY,
        apiKeyLength: process.env.PUBLIC_DATA_API_KEY?.length || 0,
        error: errorMessage
      }
    });
  }
}
