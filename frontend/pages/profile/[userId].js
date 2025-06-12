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
import { LoadingOutlined } from "@ant-design/icons"

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



const ProfilePage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const dispatch = useDispatch();

  const [showSetting, setShowSetting] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const data = useSelector((state) => state.profile_jh?.data);
  const { user } = useSelector((state) => state.user_YG);
  const isMyProfile = user && data && user.id === data.id;

  // 기본 프로필 정보 로드 (userId 기반으로 이미 SSR에서 호출됨)
  useEffect(() => {
    if (!data && userId) {
      // data가 없으면 (SSR 실패 시) 다시 요청 (optional)
      dispatch({ type: LOAD_USER_INFO_REQUEST, data: userId });
    }
  }, [data, dispatch]);

  useEffect(() => {
    const removePadding = document.getElementById("mainContents");
    if (removePadding) {
      removePadding.style.padding = "0";
    }
  }, []);

  const reloadLogInUser = useCallback(() => {
    dispatch({ type: LOAD_MY_INFO_REQUEST });
  }, [dispatch]);

  const fetchUserInfo = () => {
    if (data) {
      dispatch({ type: LOAD_USER_INFO_REQUEST, data: data.id });
    }
  };

  const { statusCode, data: profileData } = useSelector((state) => state.profile_jh);

  if (statusCode === 404) {
    return (
      <AppLayout>
        <ERROR>
          <ErrorMessage>404 | 존재하지 않는 계정입니다</ErrorMessage>
        </ERROR>
      </AppLayout>
    );
  }

  if (!profileData && statusCode !== 404) {
  return (
    <AppLayout>
      <ERROR>
        <ErrorMessage><LoadingOutlined />로딩 중...</ErrorMessage>
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
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              padding: "1% 1% 0 0",
            }}
          >
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

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  const cookie = context.req?.headers.cookie || "";
  axios.defaults.headers.Cookie = "";
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  const userId = context.params.userId;

  context.store.dispatch({ type: LOAD_USER_INFO_REQUEST, data: userId });
  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();

  return { props: {} };
});


export default ProfilePage;
