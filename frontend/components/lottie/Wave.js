// frontend/components/lottie/Wave.js

import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import WaveLottie from '../../public/lottie/wave.json'; // ✅ 이 경로가 정확한지 다시 한번 확인!

const Wave = ({ isHovered }) => {
  const lottieRef = useRef(null);

  useEffect(() => {
    if (lottieRef.current && lottieRef.current.animationData) {
      const totalFrames = lottieRef.current.animationData.op;

      if (isHovered) {
        lottieRef.current.setDirection(1);
        lottieRef.current.playSegments([0, totalFrames], true);
      } else {
        const currentFrame = lottieRef.current.currentFrame || 0;
        lottieRef.current.setDirection(-1);
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
        animationData={WaveLottie}
        loop={false}
        autoplay={false}
        style={{
          width: '100%',
          height: '100%',
        }}
        rendererSettings={{ // ✅ 이 부분을 추가
          preserveAspectRatio: 'xMidYMid slice' // ✅ Lottie가 부모 컨테이너에 맞춰 잘리도록 설정
        }}
      />
    </div>
  );
};

export default Wave;