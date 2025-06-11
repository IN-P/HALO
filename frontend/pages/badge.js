import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { LOAD_BADGE_REQUEST, ADD_BADGE_REQUEST } from "../reducers/badge_JH";

const Container = styled.div`
  padding: 40px 32px;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Apple SD Gothic Neo', sans-serif;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #1e293b;
`;

const BadgeList = styled.ul`
  list-style: none;
  padding: 0;
`;

const BadgeItem = styled.li`
  padding: 16px;
  background: #f1f5f9;
  border-radius: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BadgeName = styled.span`
  font-weight: 600;
  color: #334155;
`;

const BadgeStatus = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const BadgeID = styled.span`
  font-size: 16px;
`

const Badge = () => {
  const dispatch = useDispatch();
  const {
    badges,
    loadBadgeLoading,
    loadBadgeDone,
    loadBadgeError,
    addBadgeLoading,
    addBadgeDone,
    addBadgeError,
  } = useSelector((state) => state.badge_JH);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imgFile, setImgFile] = useState(null);

  useEffect(() => {
    if (!loadBadgeDone) {
      dispatch({ type: LOAD_BADGE_REQUEST });
    }
  }, [dispatch, loadBadgeDone]);

  useEffect(() => {
    if (addBadgeDone) {
      alert("뱃지가 성공적으로 추가되었습니다.");
      setName("");
      setDescription("");
      setImgFile(null);
      dispatch({ type: LOAD_BADGE_REQUEST });
    }
  }, [addBadgeDone, dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("뱃지 이름은 필수입니다.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (imgFile) {
      formData.append("img", imgFile); // key 이름 'img'는 백엔드 multer 설정과 동일해야 함
    }

    dispatch({
      type: ADD_BADGE_REQUEST,
      data: formData,
    });
  };

  const onChangeImg = (e) => {
    const file = e.target.files[0];
    setImgFile(file);
  };

  return (
    <AppLayout>
      <Container>
        <Title>뱃지 관리</Title>

        <form onSubmit={onSubmit} encType="multipart/form-data">
          <div>
            <label>이름:</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>설명:</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label>이미지 업로드:</label>
            <input type="file" accept="image/*" onChange={onChangeImg} />
            {imgFile && <p>선택된 파일: {imgFile.name}</p>}
          </div>
          <button type="submit" disabled={addBadgeLoading}>
            {addBadgeLoading ? "추가 중..." : "뱃지 추가"}
          </button>
        </form>

        {loadBadgeLoading && <p>로딩중...</p>}
        {loadBadgeError && <p>에러: {loadBadgeError.message || loadBadgeError}</p>}

        {!loadBadgeLoading && !loadBadgeError && (
          <BadgeList>
            {Array.isArray(badges) && badges.length === 0 ? (
              <p>등록된 뱃지가 없습니다.</p>
            ) : (
              Array.isArray(badges) &&
              badges.map((badge) => (
                <BadgeItem key={badge.id}>
                  <BadgeID>{badge.id}</BadgeID>
                  <BadgeName>{badge.name}</BadgeName>
                  {badge.description && <BadgeStatus>{badge.description}</BadgeStatus>}
                  {badge.img && <img src={`http://localhost:3065${badge.img}`} alt={badge.name} style={{ width: 40, marginLeft: 8 }} />}
                </BadgeItem>
              ))
            )}
          </BadgeList>
        )}

        {addBadgeError && <p style={{ color: "red" }}>추가 실패: {addBadgeError.message || addBadgeError}</p>}
      </Container>
    </AppLayout>
  );
};

export default Badge;
