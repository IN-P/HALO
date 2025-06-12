import React, { useEffect, useRef, useState } from "react";
import { Input, Button } from 'antd';

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

function loadKakaoScript(callback) {
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
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services,places`;
  script.async = true;
  script.onload = callback;
  document.head.appendChild(script);
}

const SelectMapModal = ({ visible, onClose, onSelect }) => {
  const mapRef = useRef();
  const [search, setSearch] = useState('');
  const [address, setAddress] = useState("");
  const [coord, setCoord] = useState({ lat: 37.5665, lng: 126.9780 });
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!visible) return;
    loadKakaoScript(() => {
      if (!window.kakao || !window.kakao.maps) return;

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(coord.lat, coord.lng),
        level: 3,
      });
      const geocoder = new window.kakao.maps.services.Geocoder();

      let marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(coord.lat, coord.lng),
        map,
      });

      // 지도 클릭
      window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
        const latlng = mouseEvent.latLng;
        marker.setPosition(latlng);
        setCoord({ lat: latlng.getLat(), lng: latlng.getLng() });
        geocoder.coord2Address(
          latlng.getLng(),
          latlng.getLat(),
          function (result, status) {
            if (status === window.kakao.maps.services.Status.OK) {
              const addr =
                result[0].road_address?.address_name ||
                result[0].address.address_name;
              setAddress(addr);
            }
          }
        );
      });

      // 검색 결과 클릭용 global 함수 (안전하게 매번 바인딩)
      window.setMapMarkerPosition = (lat, lng, addr) => {
        const latlng = new window.kakao.maps.LatLng(lat, lng);
        marker.setPosition(latlng);
        map.panTo(latlng);
        setCoord({ lat, lng });
        setAddress(addr);
      };
    });
    // eslint-disable-next-line
  }, [visible]);

  // 장소 검색 핸들러
  const handleSearch = () => {
    if (!window.kakao || !window.kakao.maps || !search) return;
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(search, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    });
  };

  if (!visible) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalBoxStyle}>
        {/* 오른쪽 위 닫기(X) */}
        <button style={closeBtnStyle} onClick={onClose}>×</button>
        {/* 검색바 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="장소명, 주소 검색"
            style={{ flex: 1 }}
            allowClear
            onPressEnter={e => {
              e.preventDefault();
              handleSearch();
            }}
          />
          <Button type="primary" htmlType="button" onClick={handleSearch}>검색</Button>
        </div>
        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div style={{
            maxHeight: 110, overflowY: 'auto', background: '#fafafa',
            marginBottom: 8, borderRadius: 8, border: '1px solid #eee', padding: 6
          }}>
            {searchResults.map(item => (
              <div
                key={item.id}
                style={{ cursor: 'pointer', padding: '3px 0', color: '#1558d6', fontSize: 15 }}
                onClick={() => {
                  window.setMapMarkerPosition(
                    Number(item.y), Number(item.x), item.address_name || item.road_address_name || item.place_name
                  );
                }}
              >
                {item.place_name} <span style={{ color: '#999' }}>{item.address_name || item.road_address_name}</span>
              </div>
            ))}
          </div>
        )}
        {/* 지도 */}
        <div ref={mapRef} style={{ width: 420, height: 320, borderRadius: 12, marginBottom: 10 }} />
        <div style={{ marginBottom: 8 }}>
          <strong>선택한 위치:</strong> {address}
        </div>
        {/* 하단 버튼 2개 */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>취소</Button>
          <Button
            type="primary"
            onClick={() => {
              if (!address) return alert("지도를 클릭하거나 검색 후 위치를 선택하세요.");
              onSelect({
                address,
                latitude: coord.lat,
                longitude: coord.lng,
              });
              onClose();
            }}
          >
            위치 선택 완료
          </Button>
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed', zIndex: 6000, left: 0, top: 0, width: '100vw', height: '100vh',
  background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const modalBoxStyle = {
  background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
  padding: 20, position: 'relative', width: 450, minHeight: 440,
};
const closeBtnStyle = {
  position: 'absolute', top: 12, right: 18, fontSize: 28, background: 'none', border: 'none', cursor: 'pointer',
};

export default SelectMapModal;
