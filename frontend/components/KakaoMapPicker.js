import React, { useEffect, useRef } from "react";

const KakaoMapPicker = ({ latitude, longitude, setLatitude, setLongitude, location, setLocation }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.kakao) return;

    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(latitude || 37.5665, longitude || 126.9780), // 서울시청 기본
      level: 3
    };
    const map = new window.kakao.maps.Map(container, options);
    const geocoder = new window.kakao.maps.services.Geocoder();

    let marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(latitude || 37.5665, longitude || 126.9780),
      map
    });

    // 지도 클릭시
    window.kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
      const latlng = mouseEvent.latLng;
      marker.setPosition(latlng);
      setLatitude(latlng.getLat());
      setLongitude(latlng.getLng());
      // 좌표 → 주소 변환
      geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const addr = result[0].address.address_name;
          setLocation(addr);
        }
      });
    });

    // 이미 좌표가 있으면 지도 이동
    if (latitude && longitude) {
      map.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
    }
  }, [latitude, longitude, setLatitude, setLongitude, setLocation]);

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: 300, borderRadius: 8, marginBottom: 8 }} />
    </div>
  );
};

export default KakaoMapPicker;
