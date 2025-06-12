import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../components/AppLayout";
import MyHeader from "../../components/mypage/MyHeader";
import MyAvatar from "../../components/mypage/MyAvatar";
import MyMain from "../../components/mypage/MyMain";
import MySettingMain from "../../components/mypage/MySettingMain";
import ProfilePost from "../../components/mypage/ProfilePost";
import { useDispatch, useSelector } from "react-redux";
import { LOAD_USER_INFO_REQUEST } from "../../reducers/profile_jh";
import { LOAD_MY_INFO_REQUEST } from "../../reducers/user_YG";
import wrapper from "../../store/configureStore";
import { END } from "redux-saga";
import axios from "axios";
import styled from "styled-components";
import useRequireLogin from '../../hooks/useRequireLogin';

const ERROR = styled.div`
  display: flex;
  height: 100vh;
  width: 70vw;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const ErrorMessage = styled.span`
  font-weight: 200;
  font-size: 32px;
  color: #999;
`;

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  const cookie = context.req?.headers.cookie || "";
  axios.defaults.headers.Cookie = "";
  if (context.req && cookie) { axios.defaults.headers.Cookie = cookie; }

  // 로그인 정보
  context.store.dispatch({ type: LOAD_MY_INFO_REQUEST });

  // 프로필 유저 정보도 서버사이드에서 미리 요청
  const userId = context.params?.userId;
  if (userId) {
    context.store.dispatch({ type: LOAD_USER_INFO_REQUEST, data: userId });
  }

  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();

  axios.defaults.headers.Cookie = "";

  return { props: {} };
});


const ProfilePage = () => {
  useRequireLogin();
  const dispatch = useDispatch();
  const router = useRouter();
  const { userId } = router.query;

  const [showSetting, setShowSetting] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { user, loadMyInfoLoading, loadMyInfoError } = useSelector((state) => state.user_YG);
  const data = useSelector((state) => state.profile_jh?.data);
  const { statusCode } = useSelector((state) => state.profile_jh);

  const isMyProfile = user && data && user.id === data.id;

  useEffect(() => {
    const removePadding = document.getElementById("mainContents");
    if (removePadding) removePadding.style.padding = "0";
  }, []);

  const reloadLogInUser = useCallback(() => {
    dispatch({ type: LOAD_MY_INFO_REQUEST });
  }, [dispatch]);

  const fetchUserInfo = () => {
    if (data) {
      dispatch({ type: LOAD_USER_INFO_REQUEST, data: data.id });
    }
  };

  useEffect(() => {
    if (!loadMyInfoLoading && loadMyInfoError) {
      router.push('/');
    }
  }, [loadMyInfoLoading, loadMyInfoError]);

  // ✅ 로그인 확인 전에는 아무것도 렌더링하지 않음
  if (loadMyInfoLoading || typeof loadMyInfoLoading === "undefined") {
    return null; // 또는 로딩 스피너 등
  }

  

  if (statusCode === 404) {
    return (
      <AppLayout>
        <ERROR>
          <ErrorMessage>404 | 존재하지 않는 계정입니다</ErrorMessage>
        </ERROR>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {showSetting && isMyProfile ? (
        <MySettingMain
          onClose={() => setShowSetting(false)}
          data={data}
          reload={fetchUserInfo}
          reloadLogInUser={reloadLogInUser}
        />
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "end", padding: "1% 1% 0 0" }}>
            <MyHeader
              data={data}
              onClickSetting={() => setShowSetting(true)}
              isMyProfile={isMyProfile}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <MyAvatar data={data} />
            <div style={{ width: "30px" }} />
            <MyMain
              key={refetchTrigger}
              data={data}
              reload={fetchUserInfo}
              isMyProfile={isMyProfile}
              loginUser={user}
              onRefetch={() => setRefetchTrigger((prev) => prev + 1)}
            />
          </div>
          <ProfilePost
            data={data}
            isMyProfile={isMyProfile}
            isBlocked={data?.isBlocked || data?.isBlockedByTarget}
          />
        </div>
      )}
    </AppLayout>
  );
};


export default ProfilePage;
