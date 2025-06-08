import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../components/AppLayout";
import MyHeader from "../../components/mypage/MyHeader";
import MyAvatar from "../../components/mypage/MyAvatar";
import MyMain from "../../components/mypage/MyMain";
import MyPost from "../../components/mypage/MyPost";
import MySettingMain from "../../components/mypage/MySettingMain";
import ProfilePost from "../../components/mypage/ProfilePost";
import { InboxOutlined, NumberOutlined, TagOutlined } from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";
import { LOAD_USER_INFO_REQUEST } from "../../reducers/profile_jh";
import wrapper from "../../store/configureStore";
import { END } from "redux-saga";
import axios from "axios";
import MyBookmark from "../../components/mypage/MyBookmark";


const ProfilePage = () => {
  // c
  const router = useRouter();
  const { nickname } = router.query;
  console.log("INSERTING NICKNAME :"+ nickname);
  
  const dispatch = useDispatch();
  const [showSetting, setShowSetting] = useState(false);
  
  // nickname이 바뀔 때마다 정보 요청
  useEffect(() => {
    if (nickname) {
      dispatch({ type: LOAD_USER_INFO_REQUEST, data: nickname });
    }
  }, [dispatch, nickname]);
  
  // redux에서 data 가져오기
  const data = useSelector((state) => state.profile_jh?.data);
  console.log("data1", data)

  // 로그인된 유저 정보 가져오기
  const { user } = useSelector((state) => state.user_YG);

  const isMyProfile = user && data && user.id === data.id;

  // 레이아웃 패딩 값 지우기
  useEffect(() => {
  const removePadding = document.getElementById("mainContents");

  if (removePadding) { removePadding.style.padding = "0"; } }, []);


  // 정보 변경 후 데이터 다시 로드
  const fetchUserInfo = () => {
  dispatch({ type: LOAD_USER_INFO_REQUEST, data: nickname }); };

  // v
  return (
  <AppLayout>
    {/* 본인의 프로필인지 확인 */}
    {showSetting && isMyProfile ? (
      <MySettingMain onClose={() => setShowSetting(false)} data={data}  reload={fetchUserInfo} />
    ) : (
      <div>
        <div style={{ display: "flex", justifyContent: "end", padding: "1% 1% 0 0" }}>
          {/* 프로필 헤더 아이콘 */}
          <MyHeader data={data} onClickSetting={() => setShowSetting(true)} isMyProfile={isMyProfile} />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {/* 프로필 이미지 */}
          <MyAvatar data={data} />
          <div style={{ width: "30px" }} />
          {/* 프로필 영역 */}
          <MyMain data={data} isMyProfile={isMyProfile} loginUser={user} />
        </div>
        {/* POST 표시 구역 */}
        <ProfilePost data={data} isMyProfile={isMyProfile} />
      </div>
    )}
  </AppLayout>
  );
};

///////////////////////////////////////////////////////////
export const getServerSideProps = wrapper.getServerSideProps(async (context) => { 
  //1. cookie 설정
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  
  if (context.req  && cookie ) { axios.defaults.headers.Cookie = cookie;   }

  //2. redux 액션
  context.store.dispatch({ type: LOAD_USER_INFO_REQUEST, data: context.params.nickname  });
  context.store.dispatch(END);

  await  context.store.sagaTask.toPromise();
}); 
///////////////////////////////////////////////////////////

export default ProfilePage;
