import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../components/AppLayout";
import MyHeader from "../../components/mypage/MyHeader";
import MyAvatar from "../../components/mypage/MyAvatar";
import MyMain from "../../components/mypage/MyMain";
import MyPost from "../../components/mypage/MyPost";
import MySettingPopUp from "../../components/mypage/MySettingPopUp";
import { InboxOutlined, NumberOutlined, TagOutlined } from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";
import { LOAD_USER_INFO_REQUEST } from "../../reducers/profile_jh";
import wrapper from "../../store/configureStore";
import { END } from "redux-saga";
import axios from "axios";
import MyBookmark from "../../components/mypage/MyBookmark";

const ProfilePage = () => {
  const router = useRouter();
  const { nickname } = router.query;
  console.log("INSERTING NICKNAME :" + nickname);

  const dispatch = useDispatch();
  const [showSetting, setShowSetting] = useState(false);

  const [refetchTrigger, setRefetchTrigger] = useState(0); // 율비: 상태 갱신 트리거 추가

  // nickname 또는 트리거 변경될 때마다 정보 요청
  useEffect(() => {
    if (nickname) {
      dispatch({ type: LOAD_USER_INFO_REQUEST, data: nickname });
    }
  }, [dispatch, nickname, refetchTrigger]); // 율비: refetchTrigger 의존성 추가

  const data = useSelector((state) => state.profile_jh?.data);
  console.log("data1", data);

  const { user } = useSelector((state) => state.user_YG);
  const isMyProfile = user && data && user.id === data.id;

  // 레이아웃 패딩 제거
  useEffect(() => {
    const removePadding = document.getElementById("mainContents");
    if (removePadding) {
      removePadding.style.padding = "0";
    }
  }, []);

  return (
    <AppLayout>
      {showSetting && isMyProfile ? (
        <MySettingPopUp onClose={() => setShowSetting(false)} data={data} />
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "end", padding: "1% 1% 0 0" }}>
            <MyHeader data={data} onClickSetting={() => setShowSetting(true)} isMyProfile={isMyProfile} />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <MyAvatar data={data} />
            <div style={{ width: "30px" }} />
            <MyMain
              key={refetchTrigger} //율비
              data={data}
              isMyProfile={isMyProfile}
              onRefetch={() => setRefetchTrigger((prev) => prev + 1)} // 율비: MyMain에게 갱신함수 넘김
            />
          </div>
          <hr style={{ marginTop: "3%" }} />
          <div style={{ display: "flex", justifyContent: "center", gap: "100px" }}>
            <span><InboxOutlined />&nbsp;게시물</span>
            <span><TagOutlined />&nbsp;북마크</span>
            <span><NumberOutlined />&nbsp;태그됨</span>
          </div>
          <MyPost data={data} />
          <MyBookmark data={data} />
        </div>
      )}
    </AppLayout>
  );
};

///////////////////////////////////////////////////////////
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';

  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  context.store.dispatch({ type: LOAD_USER_INFO_REQUEST, data: context.params.nickname });
  context.store.dispatch(END);

  await context.store.sagaTask.toPromise();
});
///////////////////////////////////////////////////////////

export default ProfilePage;
