'use client';

import { X, Phone, MapPin, Star, Users, Check, Minus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCare } from '@/lib/context/CareContext';
import type { CareFacility } from '@/types/care';

interface FacilityCompareProps {
  facilities: CareFacility[];
  onClose?: () => void;
}

export function FacilityCompare({ facilities, onClose }: FacilityCompareProps) {
  const { toggleCompare, clearCompare } = useCare();

  if (facilities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-2">
          <Users className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">비교할 시설을 선택하세요</h3>
        <p className="text-sm text-gray-500">
          시설 카드에서 비교 버튼을 클릭하여 최대 3개까지 비교할 수 있습니다
        </p>
      </div>
    );
  }

  const CompareValue = ({ value, type = 'text' }: { value: string | number | undefined; type?: string }) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-gray-400">-</span>;
    }
    return <span className="text-gray-900">{value}</span>;
  };

  const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
      <span className="font-medium">{rating}</span>
    </div>
  );

  const AvailabilityBadge = ({ available }: { available: boolean | undefined }) => (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
      available === true ? 'bg-green-100 text-green-700' :
      available === false ? 'bg-red-100 text-red-700' :
      'bg-gray-100 text-gray-600'
    }`}>
      {available === true ? (
        <><Check className="w-3 h-3" /> 가능</>
      ) : available === false ? (
        <><X className="w-3 h-3" /> 대기</>
      ) : (
        <><Minus className="w-3 h-3" /> 확인필요</>
      )}
    </span>
  );

  const typeColors: Record<string, string> = {
    '주간보호센터': 'bg-amber-100 text-amber-800',
    '요양원': 'bg-blue-100 text-blue-800',
    '재가서비스': 'bg-green-100 text-green-800',
    '양로원': 'bg-purple-100 text-purple-800',
    '요양병원': 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white flex items-center justify-between">
        <h3 className="font-bold">시설 비교 ({facilities.length}/3)</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={clearCompare}
            className="text-white hover:bg-white/20 text-xs h-7"
          >
            모두 제거
          </Button>
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Compare Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 w-32">항목</th>
              {facilities.map(facility => (
                <th key={facility.id} className="text-left px-4 py-3 relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleCompare(facility.id)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <div className="pr-8">
                    <div className="font-bold text-gray-900">{facility.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[facility.type] || 'bg-gray-100'}`}>
                      {facility.type}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* 평점 */}
            <tr>
              <td className="px-4 py-3 text-sm text-gray-500">평점</td>
              {facilities.map(f => (
                <td key={f.id} className="px-4 py-3">
                  <RatingStars rating={f.rating} />
                  <span className="text-xs text-gray-400 ml-1">({f.reviewCount})</span>
                </td>
              ))}
            </tr>

            {/* 월 비용 */}
            <tr className="bg-blue-50/30">
              <td className="px-4 py-3 text-sm text-gray-500">월 비용</td>
              {facilities.map(f => (
                <td key={f.id} className="px-4 py-3 font-bold text-blue-600">
                  {(f.monthlyFee.min / 10000).toFixed(0)}~{(f.monthlyFee.max / 10000).toFixed(0)}만원
                </td>
              ))}
            </tr>

            {/* 주소 */}
            <tr>
              <td className="px-4 py-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> 주소
                </div>
              </td>
              {facilities.map(f => (
                <td key={f.id} className="px-4 py-3 text-sm">
                  <CompareValue value={f.address} />
                </td>
              ))}
            </tr>

            {/* 전화번호 */}
            <tr>
              <td className="px-4 py-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> 전화
                </div>
              </td>
              {facilities.map(f => (
                <td key={f.id} className="px-4 py-3 text-sm">
                  <a href={`tel:${f.phone}`} className="text-blue-600 hover:underline">
                    {f.phone}
                  </a>
                </td>
              ))}
            </tr>

            {/* 정원/현원 */}
            <tr>
              <td className="px-4 py-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> 정원/현원
                </div>
              </td>
              {facilities.map(f => (
                <td key={f.id} className="px-4 py-3 text-sm">
                  {f.detailInfo?.totalCapacity ? (
                    <>
                      {f.detailInfo.currentOccupancy || 0}/{f.detailInfo.totalCapacity}명
                      {f.detailInfo.totalCapacity && f.detailInfo.currentOccupancy && (
                        <span className={`ml-2 text-xs ${
                          f.detailInfo.totalCapacity > f.detailInfo.currentOccupancy
                            ? 'text-green-600 font-medium'
                            : 'text-red-500'
                        }`}>
                          ({f.detailInfo.totalCapacity - f.detailInfo.currentOccupancy}자리)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              ))}
            </tr>

            {/* 입소 가능 */}
            <tr className="bg-green-50/30">
              <td className="px-4 py-3 text-sm text-gray-500">입소 가능</td>
              {facilities.map(f => (
                <td key={f.id} className="px-4 py-3">
                  <AvailabilityBadge available={f.availableSlots} />
                </td>
              ))}
            </tr>

            {/* 특화 서비스 */}
            <tr>
              <td className="px-4 py-3 text-sm text-gray-500">특화 서비스</td>
              {facilities.map(f => (
                <td key={f.id} className="px-4 py-3">
                  {f.specialties && f.specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {f.specialties.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              ))}
            </tr>

            {/* 종사자 수 */}
            <tr>
              <td className="px-4 py-3 text-sm text-gray-500">종사자 수</td>
              {facilities.map(f => (
                <td key={f.id} className="px-4 py-3 text-sm">
                  <CompareValue
                    value={f.detailInfo?.employeeCount ? `${f.detailInfo.employeeCount}명` : undefined}
                  />
                </td>
              ))}
            </tr>

            {/* 홈페이지 */}
            <tr>
              <td className="px-4 py-3 text-sm text-gray-500">홈페이지</td>
              {facilities.map(f => (
                <td key={f.id} className="px-4 py-3 text-sm">
                  {f.website || f.detailInfo?.homepage ? (
                    <a
                      href={f.website || f.detailInfo?.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      방문
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={clearCompare}>
          비교 초기화
        </Button>
        <Button size="sm">
          상담 신청
        </Button>
      </div>
    </div>
  );
}
