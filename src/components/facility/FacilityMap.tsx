'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CareFacility } from '@/types/care';

interface FacilityMapProps {
  facilities: CareFacility[];
  selectedFacility?: CareFacility;
  onFacilitySelect?: (facility: CareFacility) => void;
  height?: string;
}

// 서울 기본 좌표
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };
const DEFAULT_ZOOM = 12;

// 시설 유형별 마커 색상
const typeColors: Record<string, string> = {
  '주간보호센터': '#F59E0B',
  '요양원': '#3B82F6',
  '재가서비스': '#10B981',
  '양로원': '#8B5CF6',
  '요양병원': '#EF4444'
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMap = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMarker = any;

export function FacilityMap({
  facilities,
  selectedFacility,
  onFacilitySelect,
  height = '400px'
}: FacilityMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Leaflet 동적 로드
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Leaflet JS
        if (!window.L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Leaflet 로드 실패:', err);
        setError('지도를 불러오는데 실패했습니다.');
      }
    };

    loadLeaflet();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || !window.L) return;

    // 기존 맵 제거
    if (mapRef.current) {
      mapRef.current.remove();
    }

    // 새 맵 생성
    const map = window.L.map(mapContainerRef.current).setView(
      [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      DEFAULT_ZOOM
    );

    // OpenStreetMap 타일 레이어
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isLoaded]);

  // 마커 업데이트
  useEffect(() => {
    if (!mapRef.current || !window.L || facilities.length === 0) return;

    const L = window.L;
    const map = mapRef.current;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // 주소 기반 좌표 (실제 구현에서는 Geocoding API 사용)
    // 여기서는 시설별 랜덤 위치 생성 (데모용)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bounds: any = L.latLngBounds([]);

    facilities.forEach((facility, index) => {
      // 시설 위치 (detailInfo에 좌표가 있으면 사용, 없으면 랜덤)
      const lat = facility.detailInfo?.latitude || DEFAULT_CENTER.lat + (Math.random() - 0.5) * 0.1;
      const lng = facility.detailInfo?.longitude || DEFAULT_CENTER.lng + (Math.random() - 0.5) * 0.1;

      // 커스텀 아이콘
      const color = typeColors[facility.type] || '#6B7280';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(`
          <div style="min-width: 200px;">
            <strong>${facility.name}</strong>
            <div style="color: ${color}; font-size: 12px; margin: 4px 0;">${facility.type}</div>
            <div style="font-size: 12px; color: #666;">${facility.address}</div>
            <div style="font-size: 12px; margin-top: 4px;">
              <span style="color: #F59E0B;">★</span> ${facility.rating}
              <span style="margin-left: 8px; color: #3B82F6; font-weight: bold;">
                ${(facility.monthlyFee.min / 10000).toFixed(0)}~${(facility.monthlyFee.max / 10000).toFixed(0)}만원
              </span>
            </div>
            <div style="margin-top: 8px;">
              <a href="tel:${facility.phone}" style="color: #3B82F6; font-size: 12px;">
                ${facility.phone}
              </a>
            </div>
          </div>
        `)
        .addTo(map);

      if (onFacilitySelect) {
        marker.on('click', () => onFacilitySelect(facility));
      }

      markersRef.current.push(marker);
      bounds.extend([lat, lng]);
    });

    // 모든 마커가 보이도록 뷰 조정
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [facilities, isLoaded, onFacilitySelect]);

  // 선택된 시설로 이동
  useEffect(() => {
    if (!mapRef.current || !selectedFacility || !window.L) return;

    const lat = selectedFacility.detailInfo?.latitude || DEFAULT_CENTER.lat;
    const lng = selectedFacility.detailInfo?.longitude || DEFAULT_CENTER.lng;

    mapRef.current.setView([lat, lng], 15);
  }, [selectedFacility]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleLocate = () => {
    if (!mapRef.current) return;
    mapRef.current.locate({ setView: true, maxZoom: 14 });
  };

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-xl border"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
      {/* 로딩 표시 */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p>지도 로딩 중...</p>
          </div>
        </div>
      )}

      {/* 지도 컨테이너 */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 컨트롤 버튼 */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleZoomIn}
          className="h-8 w-8 p-0 bg-white shadow-md"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleZoomOut}
          className="h-8 w-8 p-0 bg-white shadow-md"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleLocate}
          className="h-8 w-8 p-0 bg-white shadow-md"
          title="내 위치"
        >
          <Locate className="w-4 h-4" />
        </Button>
      </div>

      {/* 범례 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-[1000]">
        <div className="text-xs font-medium text-gray-700 mb-2">시설 유형</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Leaflet 타입 선언
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}
