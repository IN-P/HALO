import React, { useCallback } from "react";
import styled from "styled-components";
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Input, Tooltip, Button } from 'antd';
import { useRouter } from "next/router";

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

  &:hover {
    background-color: #F2F2F2;
  }
`;

const StyledEditBar = styled.div`
  height: 24vh;
  background-color: #EDEDED;
  margin: 0.2%;
  border-radius: 0px 0px 4px 4px;
  padding-right: 3%;
  padding-Top: 0.5%;
  
  text-align: right;
`;

const ErrorMessage = styled.div`
  color: #FF4C4C;
`;
const SuccessMessage = styled.div`
  color: #0DDB39;
`;

const MySettingEditForm = ({ data }) => {
  // c
  const router = useRouter();


  // v
  return (
    <div>
      <StyledBar>{data?.nickname}</StyledBar>
        <StyledEditBar>
          <div>
            <p style={{fontSize:"18px", fontWeight:"bold"}}>사용자 이름 변경</p>
          </div>
          <div>
          <Input
            style={{ width: "50%", height: "50px", fontSize: "18px"}}
            placeholder="사용자 이름을 입력해주세요"
            prefix={<UserOutlined className="site-form-item-icon" />}
            suffix={
              <Tooltip title="이 이름은 중복 사용이 불가합니다">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            } />
            <ErrorMessage>❌ 사용할 수 없는 이름입니다</ErrorMessage>
            <SuccessMessage>✔ 사용할 수 있는 이름입니다</SuccessMessage>
          </div>
          <div>
            <Button>변경</Button>
          </div>
        </StyledEditBar>
      <StyledBar >{data?.email}</StyledBar>
      <StyledBar >{data?.UserInfo.phone}</StyledBar>
      <StyledBar >{data?.UserInfo.introduce}</StyledBar>
      <StyledBar >{data?.is_private === 1 ? '비공개' : '공개'}</StyledBar>
      <StyledBar >{data?.Myteam.teamname}</StyledBar>
      <StyledBar >100,000</StyledBar>
    </div>
  )
}

export default MySettingEditForm;