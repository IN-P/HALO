// frontend/components/lottie/Wave.js

import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import WaveLottie from '../../public/lottie/wave.json'; // ✅ 변수 이름을 WaveLottie로 통일! (경로도 다시 확인)

const Wave = ({ isHovered }) => {
  const lottieRef = useRef(null);

  useEffect(() => {
    // ✅ Lottie 인스턴스와 애니메이션 데이터가 모두 로드되었는지 확인
    if (lottieRef.current && lottieRef.current.animationData) {
      const totalFrames = lottieRef.current.animationData.op; // op는 Lottie JSON의 총 프레임 수

      if (isHovered) {
        lottieRef.current.setDirection(1); // 정방향 재생
        lottieRef.current.playSegments([0, totalFrames], true); // 시작부터 끝까지 한 번 재생
      } else {
        lottieRef.current.setDirection(-1); // 역방향 재생
        // 현재 프레임에서 0프레임까지 뒤로 감기
        // lottieRef.current.currentFrame이 undefined일 수 있으므로 0으로 폴백
        const currentFrame = lottieRef.current.currentFrame || 0;
        lottieRef.current.playSegments([0, currentFrame], true);
      }
    }
  }, [isHovered]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      opacity: 1,
      borderRadius: '8px',
    }}>
      <Lottie
        lottieRef={lottieRef}
        animationData={WaveLottie} // ✅ 임포트한 WaveLottie 변수를 사용
        loop={false}
        autoplay={false}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default Wave;