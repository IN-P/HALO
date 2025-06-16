import React, { useState  } from "react";
import { useSelector } from 'react-redux';
import { useRouter } from "next/router";
import axios from "axios"
import styled from "styled-components";
import { InfoCircleOutlined, UserOutlined, MailOutlined, PhoneTwoTone, UnlockTwoTone, LockFilled  } from '@ant-design/icons';
import { Input, Tooltip, Button, Radio, Select, message } from 'antd';

const StyledBar = styled.div`
  height: 8vh;
  margin: 0.2%;
  margin-bottom: 0.4%;
  padding-right: 3%;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 24px;
  cursor: pointer;

  &:hover {
    background-color: #F2F2F2;
  }
`;
const StyledEditBar = styled.div`
  background-color: #EDEDED;
  margin: 0 0 0.5rem 0;
  border-radius: 0 0 4px 4px;
  padding: 1rem 2rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
`;
const Title = styled.p`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
`;
const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const Message = styled.div`
  font-size: 14px;
  margin-top: 0.25rem;
  color: ${({ error }) => (error ? '#FF4C4C' : '#0DDB39')};
  min-height: 20px;
`;
const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
`;

const MySettingEditForm = ({ data, reload, reloadLogInUser }) => {
  // c
  const router = useRouter();

  const { user } = useSelector((state) => state.user_YG);

  // 닉네임
  const [editNicknameOpen, setNicknameEditOpen] = useState(false);
  const toggleNickname = () => { setNicknameEditOpen(prev => !prev); };
  const [newNickname, setNewNickname] = useState(user?.nickname || "");

  // 이메일
  const [editEmailOpen, setEmailEditOpen] = useState(false);
  const toggleEmail = () => { setEmailEditOpen(prev => !prev); };
  const [newEmail, setNewEmail] = useState(user?.email || "");

  // 휴대폰
  const [editPhoneOpen, setPhoneEditOpen] = useState(false);
  const togglePhone = () => { setPhoneEditOpen(prev => !prev); };
  const [newPhone, setNewPhone] = useState(data?.UserInfo?.phone || "");

  // 소개문
  const [editIntroduceOpen, setIntroduceEditOpen] = useState(false);
  const toggleIntroduce = () => { setIntroduceEditOpen(prev => !prev); };
  const [newIntroduce, setNewIntroduce] = useState(data?.UserInfo?.introduce || "");

  // 공개 설정
  const [editPrivacyOpen, setPrivacyEditOpen] = useState(false);
  const togglePrivacy = () => { setPrivacyEditOpen(prev => !prev) };
  const [newPrivacy, setNewPrivacy] = useState(user?.is_private ?? 0);
  

  // 응원팀
  const { Option } = Select;
  const teams = [ 
    { id: 1, name: "응원팀 없음" }, { id: 2, name: "기아 타이거즈" }, { id: 3, name: "삼성 라이온즈" },
    { id: 4, name: "LG 트윈스" }, { id: 5, name: "두산 베어스" }, { id: 6, name: "KT 위즈" },
    { id: 7, name: "SSG 랜더스" }, { id: 8, name: "롯데 자이언츠" }, { id: 9, name: "한화 이글스" },
    { id: 10, name: "NC 다이노스" }, { id: 11, name: "키움 히어로즈" },
  ];
  const [editTeamOpen, setTeamEditOpen] = useState(false);
  const toggleTeam = () => setTeamEditOpen(prev => !prev);
  const [selectedTeamId, setSelectedTeamId] = useState(data?.Myteam?.id ?? 1);


  // v
  return (
    <div>
      {/* 닉네임 */}
      <StyledBar onClick={toggleNickname}>{data?.nickname}</StyledBar>
      {editNicknameOpen && (
        <StyledEditBar>
          <Title>사용자 이름 변경</Title>
          <InputWrapper>
            <Input
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              style={{ width: "100%", height: "48px", fontSize: "16px" }}
              placeholder="사용자 이름을 입력해주세요"
              prefix={<UserOutlined />}
              suffix={<Tooltip title="정책에 위배된 이름을 사용하실 경우 경고없이 제재될 수 있습니다">
                <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
              </Tooltip>}
            />
          </InputWrapper>
          <ButtonWrapper>
            <Button
              type="primary"
              onClick={async () => {
                try {
                  await axios.patch("http://localhost:3065/user", {
                    nickname: newNickname,
                  }, { withCredentials: true });

                  message.success("닉네임이 성공적으로 변경되었습니다.");
                  toggleNickname();
                  reload(); reloadLogInUser();
                } catch (err) {
                  console.error(err);
                  message.error("닉네임 변경에 실패했습니다.");
                }
              }}
            >
              변경
            </Button>
          </ButtonWrapper>
        </StyledEditBar>
      )}

      {/* 이메일 */}
      <StyledBar onClick={toggleEmail}>{user?.email}</StyledBar>
      {editEmailOpen && (
        <StyledEditBar>
          <Title>이메일 변경</Title>
          <InputWrapper>
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={{ width: "100%", height: "48px", fontSize: "16px" }}
              placeholder="변경할 이메일 주소를 입력해주세요"
              prefix={<MailOutlined />}
              suffix={
                <Tooltip title="이메일은 중복 사용이 불가합니다">
                  <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                </Tooltip>
              }
            />
          </InputWrapper>
          <ButtonWrapper>
            <Button
              type="primary"
              onClick={async () => {
                try {
                  const res = await axios.patch(
                    "http://localhost:3065/profile/update",
                    { email: newEmail },
                    { withCredentials: true }
                  );
                  message.success("이메일이 성공적으로 변경되었습니다.");
                  toggleEmail();
                  reloadLogInUser();
                } catch (err) {
                  console.error(err);
                  message.error("이메일 변경에 실패했습니다.");
                }
              }}
            >
              변경
            </Button>
          </ButtonWrapper>
        </StyledEditBar>
      )}
      
      {/* 휴대전화 */}
      <StyledBar onClick={togglePhone}>{data?.UserInfo?.phone || user?.UserInfo?.phone || "전화번호 없음"}</StyledBar>
      {editPhoneOpen && (
        <StyledEditBar>
          <Title>휴대전화번호 변경</Title>
          <InputWrapper>
            <Input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              style={{ width: "100%", height: "48px", fontSize: "16px" }}
              placeholder="변경할 휴대전화번호를 입력해주세요"
              prefix={<PhoneTwoTone />}
              suffix={<Tooltip title="전화번호는 중복 등록 불가합니다">
                <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
              </Tooltip>}
            />
          </InputWrapper>
          <ButtonWrapper>
            <Button
              type="primary"
              onClick={async () => {
                try {
                  // 공백 포함해서 newPhone 그대로 보냄
                  await axios.patch("http://localhost:3065/profile/update", {
                    phone: newPhone,
                  }, { withCredentials: true });

                  message.success("휴대전화번호가 성공적으로 변경되었습니다.");
                  togglePhone();
                  reload();
                } catch (err) {
                  console.error(err);
                  message.error("휴대전화번호 변경에 실패했습니다.");
                }
              }}
            >
              변경
            </Button>
          </ButtonWrapper>
        </StyledEditBar>
      )}

      {/* 소개문 */}
      <StyledBar onClick={toggleIntroduce}>
        {data?.UserInfo?.introduce
          ? data.UserInfo?.introduce.length > 30
            ? data.UserInfo?.introduce.slice(0, 30) + "..."
            : data.UserInfo?.introduce
          : "소개문을 입력해주세요"}
      </StyledBar>
      {editIntroduceOpen && (
        <StyledEditBar>
          <Title>소개문 변경 <span style={{ fontSize: '14px', color: 'gray' }}>(최대 120자)</span></Title>
          <InputWrapper>
            <Input.TextArea
              style={{ width: "100%", fontSize: "16px", minHeight: "100px" }}
              maxLength={120}
              value={newIntroduce}
              onChange={(e) => setNewIntroduce(e.target.value)}
              placeholder="나 자신을 소개하는 문구를 입력해주세요"
            />
          </InputWrapper>
          <ButtonWrapper>
            <Button
              type="primary"
              onClick={async () => {
                try {
                  await axios.patch("http://localhost:3065/profile/update", {
                    introduce: newIntroduce,
                  }, { withCredentials: true });

                  message.success("소개문이 성공적으로 변경되었습니다.");
                  toggleIntroduce();
                  reload();
                } catch (err) {
                  console.error(err);
                  message.error("소개문 변경에 실패했습니다.");
                }
              }}
            >
              변경
            </Button>
          </ButtonWrapper>
        </StyledEditBar>
      )}


      {/* 공개 설정 */}
      <StyledBar onClick={togglePrivacy}>{newPrivacy === 1 ? '비공개' : '공개'}</StyledBar>
      {editPrivacyOpen && (
        <StyledEditBar>
          <Title>계정 공개 설정</Title>
          <InputWrapper>
            <Radio.Group
              value={newPrivacy === 1}
              onChange={(e) => setNewPrivacy(e.target.value ? 1 : 0)}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Radio value={false}><UnlockTwoTone /> 공개 - 누구나 내 프로필을 볼 수 있어요</Radio>
              <Radio value={true}><LockFilled /> 비공개 - 승인된 사용자만 내 정보를 볼 수 있어요</Radio>
            </Radio.Group>
          </InputWrapper>
          <ButtonWrapper>
            <Button
              type="primary"
              onClick={async () => {
                try {
                  await axios.patch("http://localhost:3065/user", {
                    is_private: newPrivacy,
                  }, { withCredentials: true });

                  message.success("공개 설정이 변경되었습니다.");
                  togglePrivacy();
                  reloadLogInUser();
                } catch (err) {
                  console.error(err);
                  message.error("공개 설정 변경에 실패했습니다.");
                }
              }}
            >
              저장
            </Button>
          </ButtonWrapper>
        </StyledEditBar>
      )}

      {/* 응원팀 변경 */}
      <StyledBar onClick={toggleTeam}> {teams.find(t => t.id === selectedTeamId)?.name || "응원팀 없음"} </StyledBar>
      {editTeamOpen && (
        <StyledEditBar>
          <Title>응원팀 변경</Title>
          <InputWrapper>
            <Select
              value={selectedTeamId}
              style={{ width: '100%' }}
              onChange={(value) => setSelectedTeamId(value)}
            >
              {teams.map((team) => (
                <Option key={team.id} value={team.id}>
                  {team.name}
                </Option>
              ))}
            </Select>
          </InputWrapper>
          <ButtonWrapper>
            <Button
              type="primary"
              onClick={async () => {
                try {
                  await axios.patch(
                    "http://localhost:3065/profile/update",
                    { myteam_id: selectedTeamId }, // 서버에 팀 id만 전달
                    { withCredentials: true }
                  );
                  message.success("응원팀이 성공적으로 변경되었습니다.");
                  toggleTeam();
                  reload(); // 부모 컴포넌트의 reload 함수 호출하여 데이터 새로고침
                } catch (err) {
                  console.error(err);
                  message.error("응원팀 변경에 실패했습니다.");
                }
              }}
            >
              저장
            </Button>
          </ButtonWrapper>
        </StyledEditBar>
      )}        
    </div>
  )
}

export default MySettingEditForm;
