'use client';

import { Heart, GitCompare, Phone, MapPin, Star, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCare } from '@/lib/context/CareContext';
import type { CareFacility } from '@/types/care';

interface FacilityCardProps {
  facility: CareFacility;
  showActions?: boolean;
  compact?: boolean;
}

export function FacilityCard({ facility, showActions = true, compact = false }: FacilityCardProps) {
  const { state, toggleFavorite, toggleCompare, selectFacility } = useCare();
  const { favoriteFacilities, compareFacilities } = state.careState;

  const isFavorite = favoriteFacilities?.includes(facility.id) || false;
  const isComparing = compareFacilities?.includes(facility.id) || false;
  const canAddToCompare = (compareFacilities?.length || 0) < 3;

  const typeColors: Record<string, string> = {
    '주간보호센터': 'bg-amber-100 text-amber-800',
    '요양원': 'bg-blue-100 text-blue-800',
    '재가서비스': 'bg-green-100 text-green-800',
    '양로원': 'bg-purple-100 text-purple-800',
    '요양병원': 'bg-red-100 text-red-800'
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(facility.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isComparing && !canAddToCompare) {
      alert('최대 3개까지 비교할 수 있습니다.');
      return;
    }
    toggleCompare(facility.id);
  };

  const handleCardClick = () => {
    selectFacility(facility);
  };

  if (compact) {
    return (
      <div
        onClick={handleCardClick}
        className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{facility.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[facility.type] || 'bg-gray-100'}`}>
              {facility.type}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              {facility.rating}
            </span>
            <span>{(facility.monthlyFee.min / 10000).toFixed(0)}~{(facility.monthlyFee.max / 10000).toFixed(0)}만원</span>
          </div>
        </div>
        {showActions && (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFavoriteClick}
              className={`h-8 w-8 p-0 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900">{facility.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[facility.type] || 'bg-gray-100'}`}>
                {facility.type}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-gray-700">{facility.rating}</span>
              <span className="text-gray-400 text-sm">({facility.reviewCount})</span>
            </div>
          </div>
          {showActions && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFavoriteClick}
                className={`h-8 w-8 p-0 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCompareClick}
                className={`h-8 w-8 p-0 ${isComparing ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
                title={isComparing ? '비교에서 제외' : '비교에 추가'}
                disabled={!isComparing && !canAddToCompare}
              >
                <GitCompare className={`w-4 h-4 ${isComparing ? 'stroke-[2.5px]' : ''}`} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Address */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-gray-600">{facility.address}</span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-gray-400" />
          <a
            href={`tel:${facility.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:underline"
          >
            {facility.phone}
          </a>
        </div>

        {/* Capacity */}
        {facility.detailInfo && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              정원: {facility.detailInfo.currentOccupancy || 0}/{facility.detailInfo.totalCapacity || '?'}명
              {facility.detailInfo.totalCapacity && facility.detailInfo.currentOccupancy && (
                <span className={`ml-2 font-medium ${
                  facility.detailInfo.totalCapacity > facility.detailInfo.currentOccupancy
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}>
                  ({facility.detailInfo.totalCapacity - facility.detailInfo.currentOccupancy > 0
                    ? `${facility.detailInfo.totalCapacity - facility.detailInfo.currentOccupancy}자리 가능`
                    : '만석'})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Fee */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">예상 월 비용 (본인부담금)</div>
          <div className="font-bold text-lg text-blue-600">
            {(facility.monthlyFee.min / 10000).toFixed(0)}~{(facility.monthlyFee.max / 10000).toFixed(0)}만원
          </div>
        </div>

        {/* Specialties */}
        {facility.specialties && facility.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {facility.specialties.map((specialty, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}

        {/* Website */}
        {facility.website && (
          <a
            href={facility.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            홈페이지 방문
          </a>
        )}
      </div>

      {/* Availability badge */}
      {facility.availableSlots !== undefined && (
        <div className={`px-4 py-2 text-center text-sm font-medium ${
          facility.availableSlots ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {facility.availableSlots ? '입소 가능' : '대기 필요'}
        </div>
      )}
    </div>
  );
}
