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
  const { nearbyFacilities, favoriteFacilities, compareFacilities } = state.careState;

  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
  const [showCompare, setShowCompare] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSido, setSelectedSido] = useState('서울');
  const [selectedType, setSelectedType] = useState('전체');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [facilities, setFacilities] = useState<CareFacility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // API에서 시설 검색
  const searchFacilities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: selectedSido,
          facilityType: selectedType === '전체' ? undefined : selectedType,
          query: searchQuery
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFacilities(data.facilities || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (error) {
      console.error('시설 검색 오류:', error);
      // 폴백: 기존 상태의 시설 사용
      setFacilities(nearbyFacilities || []);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드 및 필터 변경 시 검색
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/facilities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: selectedSido,
            facilityType: selectedType === '전체' ? undefined : selectedType,
            query: searchQuery
          })
        });

        if (response.ok) {
          const data = await response.json();
          setFacilities(data.facilities || []);
          setTotalCount(data.totalCount || 0);
        }
      } catch (error) {
        console.error('시설 검색 오류:', error);
        setFacilities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedSido, selectedType, searchQuery]);

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
              <p className="text-blue-100 text-sm">전국 {totalCount.toLocaleString()}개 시설 정보</p>
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
              {/* 지역 선택 */}
              <select
                value={selectedSido}
                onChange={(e) => setSelectedSido(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white"
              >
                {SIDO_LIST.map(sido => (
                  <option key={sido} value={sido}>{sido}</option>
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
