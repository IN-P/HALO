import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { DELETE_ACCOUNT_REQUEST } from "../../reducers/user_YG";

const Container = styled.div`
  max-width: 400px;
  margin: 100px auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Label = styled.label`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #ff1f1f;
  }
`;

const Message = styled.p`
  color: red;
  text-align: center;
  margin-top: 1rem;
`;

const MySettingDelete = () => {
  const dispatch = useDispatch();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { deleteAccountLoading, deleteAccountDone, deleteAccountError } = useSelector(
    (state) => state.user_YG
  );

  const handleDelete = () => {
    if (!password) {
      setMessage("비밀번호를 입력해주세요.");
      return;
    }

    dispatch({
      type: DELETE_ACCOUNT_REQUEST,
      data: { password }, // 서버에서 필요로 하면 전달
    });
  };

useEffect(() => {
  if (deleteAccountDone) {
    alert("회원 탈퇴가 완료되었습니다.");
    window.location.href = "/login"; // 또는 window.location.replace("/login");
  }

  if (deleteAccountError) {
    setMessage(deleteAccountError);
  }
}, [deleteAccountDone, deleteAccountError]);

  return (
    <Container>
      <Title>회원 탈퇴</Title>
      <Label htmlFor="password">비밀번호 확인</Label>
      <Input
        type="password"
        id="password"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleDelete} disabled={deleteAccountLoading}>
        {deleteAccountLoading ? "처리 중..." : "탈퇴하기"}
      </Button>
      {message && <Message>{message}</Message>}
    </Container>
  );
};

export default MySettingDelete;
