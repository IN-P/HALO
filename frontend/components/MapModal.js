import React, { useEffect, useRef, useState } from 'react';

const KAKAO_KEY = "카카오API키"; // 실제 카카오 JS 키로 변경

function loadKakaoScript(callback) {
  // 이미 스크립트가 있으면 중복 삽입 막음
  if (window.kakao && window.kakao.maps) {
    callback();
    return;
  }
  const existing = document.getElementById("kakao-map-script");
  if (existing) {
    existing.onload = callback;
    return;
  }
  const script = document.createElement("script");
  script.id = "kakao-map-script";
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services`;
  script.async = true;
  script.onload = callback;
  document.head.appendChild(script);
}

const MapModal = ({ visible, onClose, location }) => {
  const mapRef = useRef();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;

    loadKakaoScript(() => {
      if (!window.kakao || !window.kakao.maps) {
        setError('지도 로드 실패');
        return;
      }

      // eslint-disable-next-line no-undef
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(location, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
          setError('');
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
          const map = new kakao.maps.Map(mapRef.current, {
            center: coords,
            level: 3,
          });
          new kakao.maps.Marker({ map, position: coords });
        } else {
          setError('위치를 찾을 수 없습니다.');
        }
      });
    });
  }, [visible, location]);

  if (!visible) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalBoxStyle}>
        <button
          style={closeBtnStyle}
          onClick={onClose}
          aria-label="지도 닫기"
          onMouseOver={e => e.currentTarget.style.color = '#e74c3c'}
          onMouseOut={e => e.currentTarget.style.color = '#222'}
        >
          ×
        </button>
        {error ? (
          <div style={{ padding: 50, textAlign: "center" }}>{error}</div>
        ) : (
          <div ref={mapRef} style={{ width: 420, height: 360, borderRadius: 12 }} />
        )}
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed', zIndex: 5000, left: 0, top: 0, width: '100vw', height: '100vh',
  background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const modalBoxStyle = {
  background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
  padding: 0, position: 'relative', width: 440, minHeight: 380,
};
const closeBtnStyle = {
  position: 'absolute',
  top: 10,
  right: 16,
  fontSize: 32, 
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#222', 
  fontWeight: 900,
  zIndex: 10,
};

export default MapModal;
