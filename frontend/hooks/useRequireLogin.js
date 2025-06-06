// 로그인이냐 로그아웃이냐 체크하고 로그아웃이면 로그인 페이지로 넘기는 훅훅훅훅훅훅훅ㄱ어퍼컷
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

const useRequireLogin = () => {
  const { isLogin } = useSelector((state) => state.user_YG);
  const router = useRouter();

  useEffect(() => {
    if (!isLogin) {
      router.replace('/login');
    }
  }, [isLogin]);
};

export default useRequireLogin;
