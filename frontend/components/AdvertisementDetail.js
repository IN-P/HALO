import React, { useEffect, useState } from 'react';
import axios from 'axios';

// PostCard에서 가져온 스타일 변수 (필요한 것만)
const IMAGE_SIZE = { width: 540, height: 640 }; // 광고 이미지를 크게 보여줄 거라면 이 사이즈를 활용
const arrowBtnStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(0,0,0,0.4)',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: 48,
  height: 48,
  fontSize: 28,
  cursor: 'pointer',
  zIndex: 1,
};

const AdvertisementDetail = ({ adId }) => {
  const [ad, setAd] = useState(null);
  const [imageIndex, setImageIndex] = useState(0); // 여러 이미지를 보여줄 경우를 대비

  useEffect(() => {
    if (!adId) return;
    const fetchAd = async () => {
      try {
        const res = await axios.get(`http://localhost:3065/api/advertisement/${adId}`);
        setAd(res.data);
      } catch (err) {
        console.error('광고 불러오기 실패:', err);
      }
    };
    fetchAd();
  }, [adId]);

  if (!ad) return <p style={{ textAlign: 'center', padding: '20px' }}>로딩 중이거나 광고를 찾을 수 없습니다...</p>;

  // 광고 이미지 배열 (단일 이미지일 수도 있지만 PostCard 형태를 위해 배열로 가정)
  // 실제 광고 데이터에 image_url 하나만 있다면, [ad.image_url]로 배열을 만들 수 있어.
  const images = ad.image_url ? [ad.image_url] : [];

  const prevImage = () => setImageIndex(i => (i > 0 ? i - 1 : images.length - 1));
  const nextImage = () => setImageIndex(i => (i < images.length - 1 ? i + 1 : 0));

  return (
    <div style={{
      display: 'flex',
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 3px 16px rgba(0,0,0,0.12)',
      margin: '32px auto', // 중앙 정렬
      overflow: 'hidden',
      position: 'relative',
      maxWidth: IMAGE_SIZE.width + 480, // PostCard와 유사한 최대 너비
      minHeight: IMAGE_SIZE.height // 최소 높이 유지
    }}>
      {/* 왼쪽 이미지 영역 */}
      <div style={{
        width: IMAGE_SIZE.width,
        height: IMAGE_SIZE.height,
        position: 'relative',
        background: '#eee',
        flexShrink: 0,
      }}>
        {images.length > 0 ? (
          <img
            src={`http://localhost:3065/uploads/advertisement_uploads/${images[imageIndex]}`}
            alt={ad.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain', // 이미지 비율 유지하며 컨테이너에 맞춤
              backgroundColor: '#eee',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#f3f3f3', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
            이미지 없음
          </div>
        )}
        {/* 이미지가 여러 개일 경우에만 화살표 표시 */}
        {images.length > 1 && (
          <>
            <button onClick={prevImage} style={{ ...arrowBtnStyle, left: 16 }}>←</button>
            <button onClick={nextImage} style={{ ...arrowBtnStyle, right: 16, left: 'auto' }}>→</button>
          </>
        )}
      </div>

      {/* 오른쪽 상세 정보 영역 */}
      <div style={{
        flex: 1,
        height: IMAGE_SIZE.height, // 이미지 영역과 높이 맞추기
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        minWidth: 390, // PostCard와 유사한 최소 너비
        boxSizing: 'border-box',
        padding: '20px 24px',
        overflowY: 'auto', // 내용이 길어지면 스크롤
      }}>
        {/* 광고 제목 */}
        <h2 style={{ fontSize: 28, marginBottom: 16, fontWeight: 'bold' }}>{ad.title}</h2>

        {/* 광고 기간 */}
        <p style={{ fontSize: 16, color: '#555', marginBottom: 8 }}>
          📅 기간: {ad.start_date?.slice(0, 10)} ~ {ad.end_date?.slice(0, 10)}
        </p>

        {/* 광고 상태 */}
        <p style={{ fontSize: 16, color: '#555', marginBottom: 20 }}>
          🔘 상태: <span style={{ fontWeight: 'bold', color: ad.is_active ? '#28a745' : '#dc3545' }}>
            {ad.is_active ? '노출중' : '비노출'}
          </span>
        </p>

        {/* 타겟 URL (버튼 형태로) */}
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            marginTop: 'auto', // 항상 하단에 붙도록
            alignSelf: 'flex-start', // 왼쪽 정렬
          }}
        >
          광고 보러가기 →
        </a>

      </div>
    </div>
  );
};

export default AdvertisementDetail;