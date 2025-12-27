'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, List, Grid, Heart, GitCompare, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FacilityCard, FacilityMap, FacilityCompare } from '@/components/facility';
import { CareProvider, useCare } from '@/lib/context/CareContext';
import type { CareFacility } from '@/types/care';
import Link from 'next/link';

// 시도 목록
const SIDO_LIST = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

// 시군구 목록 (주요 시도별)
const SIGUNGU_MAP: Record<string, string[]> = {
  '서울': ['전체', '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '부산': ['전체', '강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
  '대구': ['전체', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
  '인천': ['전체', '강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
  '광주': ['전체', '광산구', '남구', '동구', '북구', '서구'],
  '대전': ['전체', '대덕구', '동구', '서구', '유성구', '중구'],
  '울산': ['전체', '남구', '동구', '북구', '울주군', '중구'],
  '세종': ['전체'],
  '경기': ['전체', '가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
  '강원': ['전체', '강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
  '충북': ['전체', '괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
  '충남': ['전체', '계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
  '전북': ['전체', '고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
  '전남': ['전체', '강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
  '경북': ['전체', '경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
  '경남': ['전체', '거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
  '제주': ['전체', '서귀포시', '제주시']
};

// 시설 유형
const FACILITY_TYPES = [
  '전체', '주간보호센터', '요양원', '재가서비스', '양로원', '요양병원'
];

// 래퍼 컴포넌트 - CareProvider로 감싸기
export default function FacilitiesPage() {
  return (
    <CareProvider>
      <FacilitiesContent />
    </CareProvider>
  );
}

function FacilitiesContent() {
  const { state } = useCare();
  const { favoriteFacilities, compareFacilities } = state.careState;

  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
  const [showCompare, setShowCompare] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSido, setSelectedSido] = useState('서울');
  const [selectedSigungu, setSelectedSigungu] = useState('전체');
  const [selectedType, setSelectedType] = useState('전체');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [facilities, setFacilities] = useState<CareFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('v3-초기화');

  // 시도 변경 시 시군구 초기화
  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido);
    setSelectedSigungu('전체');
  };

  // API에서 시설 검색 (검색 버튼 클릭 시)
  const searchFacilities = async () => {
    setIsLoading(true);
    setDebugInfo('검색 중...');
    try {
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: selectedSido,
          sigungu: selectedSigungu === '전체' ? undefined : selectedSigungu,
          facilityType: selectedType === '전체' ? undefined : selectedType,
          query: searchQuery || undefined,
          numOfRows: 50
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFacilities(data.facilities || []);
        setTotalCount(data.totalCount || 0);
        setDebugInfo(`검색 완료: ${data.totalCount}개 (${data.isRealData ? '실제' : '샘플'})`);
      } else {
        setDebugInfo(`검색 오류: HTTP ${response.status}`);
      }
    } catch (error) {
      setFacilities([]);
      setDebugInfo(`검색 오류: ${error instanceof Error ? error.message : '알 수 없음'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드 및 필터 변경 시 검색
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setDebugInfo('API 호출 중...');

      try {
        const requestBody = {
          location: selectedSido,
          sigungu: selectedSigungu === '전체' ? undefined : selectedSigungu,
          facilityType: selectedType === '전체' ? undefined : selectedType,
          numOfRows: 50
        };

        const response = await fetch('/api/facilities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.facilities && Array.isArray(data.facilities)) {
          setFacilities(data.facilities);
          setTotalCount(data.totalCount || data.facilities.length);
          setDebugInfo(`${data.totalCount}개 (${data.isRealData ? '실제' : '샘플'})`);
        } else {
          setFacilities([]);
          setTotalCount(0);
          setDebugInfo('응답 형식 오류');
        }
      } catch (error) {
        setFacilities([]);
        setTotalCount(0);
        setDebugInfo(`오류: ${error instanceof Error ? error.message : '알 수 없음'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedSido, selectedSigungu, selectedType]);

  // 필터링된 시설 목록
  const filteredFacilities = facilities.filter(f => {
    if (showFavoritesOnly && !favoriteFacilities?.includes(f.id)) {
      return false;
    }
    if (searchQuery && !f.name.includes(searchQuery) && !f.address.includes(searchQuery)) {
      return false;
    }
    return true;
  });

  // 비교 대상 시설 목록
  const comparingFacilities = facilities.filter(f => compareFacilities?.includes(f.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="hover:bg-white/20 p-2 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">요양시설 탐색</h1>
              <p className="text-blue-100 text-sm">
                전국 {totalCount.toLocaleString()}개 시설 정보
                {process.env.NODE_ENV === 'development' && ` | ${debugInfo}`}
              </p>
              {/* 디버그: 항상 표시 (문제 해결 후 제거) */}
              <p className="text-blue-200 text-xs mt-1">
                상태: {isLoading ? '로딩중' : '완료'} | 결과: {facilities.length}개 | {debugInfo}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="시설명 또는 주소로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchFacilities()}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
            <Button
              onClick={searchFacilities}
              className="bg-white text-blue-600 hover:bg-blue-50 px-6"
            >
              검색
            </Button>
          </div>
        </div>
      </div>

      {/* Filters & View Controls */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 시도 선택 */}
              <select
                value={selectedSido}
                onChange={(e) => handleSidoChange(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white"
              >
                {SIDO_LIST.map(sido => (
                  <option key={sido} value={sido}>{sido}</option>
                ))}
              </select>

              {/* 시군구 선택 */}
              <select
                value={selectedSigungu}
                onChange={(e) => setSelectedSigungu(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white"
              >
                {(SIGUNGU_MAP[selectedSido] || ['전체']).map(sigungu => (
                  <option key={sigungu} value={sigungu}>{sigungu}</option>
                ))}
              </select>

              {/* 시설 유형 */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white"
              >
                {FACILITY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* 즐겨찾기 필터 */}
              <Button
                variant={showFavoritesOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="gap-1"
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                즐겨찾기
                {favoriteFacilities && favoriteFacilities.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                    {favoriteFacilities.length}
                  </span>
                )}
              </Button>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              {/* 비교 버튼 */}
              {compareFacilities && compareFacilities.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompare(!showCompare)}
                  className="gap-1"
                >
                  <GitCompare className="w-4 h-4" />
                  비교 ({compareFacilities.length})
                </Button>
              )}

              {/* View Mode */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-x"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="rounded-none"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Compare Panel */}
        {showCompare && comparingFacilities.length > 0 && (
          <div className="mb-6">
            <FacilityCompare
              facilities={comparingFacilities}
              onClose={() => setShowCompare(false)}
            />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredFacilities.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 조건으로 검색해 보세요</p>
          </div>
        )}

        {/* Map View */}
        {!isLoading && viewMode === 'map' && filteredFacilities.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FacilityMap
                facilities={filteredFacilities}
                height="600px"
              />
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredFacilities.map(facility => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {/* Grid View */}
        {!isLoading && viewMode === 'grid' && filteredFacilities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFacilities.map(facility => (
              <FacilityCard
                key={facility.id}
                facility={facility}
              />
            ))}
          </div>
        )}

        {/* List View */}
        {!isLoading && viewMode === 'list' && filteredFacilities.length > 0 && (
          <div className="space-y-3">
            {filteredFacilities.map(facility => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                compact
              />
            ))}
          </div>
        )}

        {/* Pagination / Load More */}
        {!isLoading && filteredFacilities.length > 0 && totalCount > filteredFacilities.length && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-2">
              {filteredFacilities.length} / {totalCount.toLocaleString()} 시설 표시
            </p>
            <Button variant="outline">
              더 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
