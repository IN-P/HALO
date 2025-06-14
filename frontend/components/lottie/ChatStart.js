// C:\Users\USER\eclipse-workspace\halo\frontend\components\lottie\ChatStart.js

import React from 'react';
import Lottie from 'lottie-react';
import ChatStartLottie from '../../public/lottie/Chat_Start.json';

const ChatStart = () => {
  console.log('ChatStart 컴포넌트 렌더링 시도...');
  console.log('Lottie 컴포넌트 렌더링 (import 방식).');

  return (
    <div style={{
        position: 'absolute',
        top: '47%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1, // ✅ 지금 zIndex가 1일 때 보인다고 했으니 이대로 둠
        opacity: 1, // ✅ 투명도도 원하는 대로 (지금은 선명하게 1로 둠)
        pointerEvents: 'none',
         width: '600px',
         height: '600px',
    }}>

      <Lottie
        animationData={ChatStartLottie}
        loop={true}
        autoplay={true}
        style={{
          width: '100%', // 이 Lottie 애니메이션은 상위 div의 100%를 차지
          height: '100%',
        }}
      />
    </div>
  );
};

export default ChatStart;