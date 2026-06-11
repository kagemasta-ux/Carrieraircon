import React, { useEffect, useRef, useState } from 'react';

// =========================================================================
// 📍 캐리어에어컨 성남총판 (성남대로 1247 / 태평역 6번 출구 바로 앞) 정밀 좌표 설정
// 지도의 핀과 중심 위치를 더욱 정교하게 미세조정하려면 아래 위도/경도를 수정하세요.
// =========================================================================
export const MAIN_STORE_LATITUDE = 33.450701;   // 지도의 핀과 중심 위치 위도
export const MAIN_STORE_LONGITUDE = 126.570667; // 지도의 핀과 중심 위치 경도

declare global {
  interface Window {
    kakao: any;
  }
}

export function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [appKey, setAppKey] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isFetchingKey, setIsFetchingKey] = useState(true);

  // Fetch Kakao App Key dynamically on mount from Express API (provides runtime support on production domains)
  useEffect(() => {
    let active = true;
    const fetchKey = async () => {
      try {
        // Fallback to build-time config first
        const localKey = (import.meta as any).env.VITE_KAKAO_APP_KEY || '';
        if (localKey) {
          if (active) {
            setAppKey(localKey);
            setIsFetchingKey(false);
          }
          return;
        }

        // Fetch runtime configured key from absolute path / api proxy
        const res = await fetch('/api/config/kakao');
        const data = await res.json();
        if (active) {
          if (data && data.success && data.appKey) {
            setAppKey(data.appKey);
          } else {
            console.warn('Kakao App Key from server config is empty or missing.');
          }
        }
      } catch (err) {
        console.error('Error fetching dynamic Kakao App Key:', err);
      } finally {
        if (active) {
          setIsFetchingKey(false);
        }
      }
    };
    fetchKey();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isFetchingKey) return;

    if (!appKey) {
      // If there is no Kakao App Key, trigger the placeholder/fallback map view
      setLoadError(true);
      return;
    }

    // Check if script is already loaded
    if (window.kakao && window.kakao.maps) {
      setIsLoaded(true);
      return;
    }

    const scriptId = 'kakao-map-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      // Note the &libraries=services and &autoload=false parameters are essential
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
      script.async = true;
      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            setIsLoaded(true);
          });
        } else {
          setLoadError(true);
        }
      };
      script.onerror = () => {
        setLoadError(true);
      };
      document.head.appendChild(script);
    } else {
      // Script already exists but kakao namespace might not be fully initialized
      const checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            setIsLoaded(true);
            clearInterval(checkInterval);
          });
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, [appKey, isFetchingKey]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.kakao || !window.kakao.maps) return;

    try {
      // 기본값 설정 (수정구가 있는 태평역 인근 좌표)
      const markerPosition = new window.kakao.maps.LatLng(MAIN_STORE_LATITUDE, MAIN_STORE_LONGITUDE);
      
      const mapOptions = {
        center: markerPosition,
        level: 3 // Default Zoom level for Kakao (lower means closer zoom)
      };

      const map = new window.kakao.maps.Map(mapRef.current, mapOptions);

      // Map Type Control & Zoom Control adding
      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

      // Adding Marker
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        clickable: true
      });
      marker.setMap(map);

      // Custom infobox design
      const contentString = `
        <div style="padding: 10px; min-width: 220px; font-family: 'Inter', sans-serif; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <h4 style="margin: 0 0 4px 0; color: #002D62; font-size: 13px; font-weight: 800; text-align: left;">캐리어에어컨 성남총판</h4>
          <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px; line-height: 1.4; text-align: left;">경기도 성남시 수정구 성남대로 1247 1층</p>
          <div style="font-size: 10px; font-weight: bold; color: #78350f; background: #fef3c7; display: inline-flex; padding: 2px 6px; border-radius: 4px; align-items: center; gap: 4px;">
            <span>💡 수인분당선 태평역 6번 출구 앞</span>
          </div>
        </div>
      `;

      const infowindow = new window.kakao.maps.InfoWindow({
        content: contentString,
        removable: true
      });

      // Default show Info Window
      infowindow.open(map, marker);

      // Click to toggle/re-open Info Window
      window.kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(map, marker);
      });

      // 📍 카카오맵 주소 검색 서비스(Geocoder) 적용
      if (window.kakao.maps.services && window.kakao.maps.services.Geocoder) {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch('성남대로 1247', function (result: any[], status: any) {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
            // 마커 위치 업데이트
            marker.setPosition(coords);
            // 지도 중심 이동
            map.setCenter(coords);
            // 인포윈도우도 해당 위치에 다시 열기
            infowindow.open(map, marker);
          }
        });
      }

    } catch (err) {
      console.error("Failed to initialize Kakao Map:", err);
      setLoadError(true);
    }
  }, [isLoaded]);

  return (
    <div className="relative w-full h-[450px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between">
      {/* API Key Status Notice */}
      {!appKey && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-amber-500/90 text-white px-4 py-2 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 backdrop-blur-xs select-none">
          <span>⚠️ 카카오맵 API 앱 키(VITE_KAKAO_APP_KEY) 미등록 상태입니다. .env 설정에 연동하시면 실시간 동적 지도가 출력됩니다.</span>
        </div>
      )}

      {loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#FDFBF7] p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 animate-pulse">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h4 className="font-bold text-slate-800 text-sm">태평역 6번 출구 캐리어에어컨 성남총판 본부</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              성남 수진동/태평로 대로변(태평역 6번 출구 바로 앞)에 위치하여 방문과 서비스 출동이 매우 편리합니다. 하단 연결 버튼으로 전용 교통편을 조회해 보세요!
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="https://map.kakao.com/link/search/%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EC%84%B1%EB%82%A8%EB%8C%80%EB%A1%9C%201247"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#FEE500] text-slate-900 text-xs font-bold rounded-lg hover:opacity-95 transition-opacity"
            >
              카카오맵에서 위치 보기
            </a>
          </div>
        </div>
      ) : (
        <div ref={mapRef} id="kakao_map_canvas" className="w-full h-full flex-1" />
      )}

      {/* Map Actions Overlay Bar */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEE500] animate-pulse"></div>
          <span className="text-slate-300 font-bold">경기도 성남시 수정구 성남대로 1247 (1층 캐리어에어컨 성남총판)</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="https://map.kakao.com/link/search/%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EC%84%B1%EB%82%A8%EB%8C%80%EB%A1%9C%201247"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial text-center px-3.5 py-1.5 bg-[#FEE500] hover:bg-[#FEE500]/90 text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            K 카카오맵 연결
          </a>
          <a
            href="https://map.naver.com/v5/search/%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EC%84%B1%EB%82%A8%EB%8C%80%EB%A1%9C%201247"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial text-center px-3.5 py-1.5 bg-[#03C75A] hover:bg-[#03C75A]/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            N 네이버 지도 연결
          </a>
        </div>
      </div>
    </div>
  );
}
