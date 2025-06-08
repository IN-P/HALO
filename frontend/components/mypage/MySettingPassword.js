import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5% 0;
`;

const Card = styled.div`
    width: 100%;
    max-width: 480px;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    background-color: #fff;
`;

const Title = styled.h2`
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 16px;
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px solid #eee;
    margin: 24px 0;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const InputGroup = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    margin-bottom: 8px;
    display: block;
    font-size: 16px;
    color: #333;
`;

const Input = styled.input`
    width: 100%;
    padding: 14px;
    font-size: 16px;
    border-radius: 8px;
    border: 1px solid #ccc;
    box-sizing: border-box;
`;

const Button = styled.button`
    margin-top: 12px;
    padding: 14px;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    background-color: #4A90E2;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #357ABD;
    }
`;

const Message = styled.div`
    margin-bottom: 16px;
    font-size: 16px;
    text-align: center;
    color: ${(props) => (props.success ? "green" : "red")};
`;

const MySettingPassword = () => {
    // c
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
        setMessage("새 비밀번호가 일치하지 않습니다.");
        setSuccess(false);
        return;
    }

    try {
        const res = await axios.patch(
        "http://localhost:3065/user/password", // ✅ 정확한 URL로 수정
        {
            currentPassword,
            newPassword,
            confirmPassword, // ✅ 서버에서 확인함
        },
        { withCredentials: true }
        );

        // 성공 메시지 수신
        setMessage(res.data || "비밀번호가 성공적으로 변경되었습니다.");
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    } catch (err) {
        console.error(err);
        if (err.response?.data) {
        setMessage(err.response.data); // 서버에서 보내준 에러 메시지 표시
        } else {
        setMessage("서버 오류");
        }
        setSuccess(false);
    }
    };


    // v
    return (
        <Container>
            <Card>
                <Title>비밀번호 변경</Title>
                <Divider />
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label>현재 비밀번호</Label>
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <Label>새 비밀번호</Label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <Label>새 비밀번호 확인</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </InputGroup>
                    {message && ( <Message success={success}>{message}</Message> )}
                    <Button type="submit">변경하기</Button>
                </Form>
            </Card>
        </Container>
    );
};

export default MySettingPassword;