import React, { useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { LOAD_USER_POINT_REQUEST } from "../../reducers/userPoint_JH";

const Container = styled.div`
  padding: 32px 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
`;

const PointCard = styled.div`
  background-color: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
`;

const PointLabel = styled.div`
  font-size: 16px;
  color: #666;
`;

const PointValue = styled.div`
  font-size: 26px;
  font-weight: bold;
  color: #ff9800;
`;

const HistoryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const HistoryItem = styled.li`
  background: #fafafa;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;

  @media (min-width: 480px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Source = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;

  @media (min-width: 480px) {
    margin-bottom: 0;
    flex: 1;
  }
`;

const Amount = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${(props) => (props.$isPlus ? "#4caf50" : "#f44336")};
  text-align: right;
  flex: 1;
`;

const DateText = styled.span`
  font-size: 13px;
  color: #999;
  text-align: right;
  flex: 1;
`;

const MySettingPoint = ({ userId }) => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.userPoint_JH);

  useEffect(() => {
    if (userId) {
      dispatch({ type: LOAD_USER_POINT_REQUEST, data: userId });
    }
  }, [dispatch, userId]);

  const totalPoint = data?.UserPoint?.total_points || 0;
  const pointLogs = data?.PointLogs || [];

  return (
    <Container>
      <Title>나의 포인트</Title>

      <PointCard>
        <PointLabel>보유 포인트</PointLabel>
        <PointValue>{totalPoint.toLocaleString()}P</PointValue>
      </PointCard>

      <HistoryTitle>포인트 내역</HistoryTitle>

      <HistoryList>
        {pointLogs.map((item) => (
          <HistoryItem key={item.id}>
            <Source>{item.source}</Source>
            <Amount $isPlus={item.type > 0}>
              {item.type > 0 ? `+${item.type}` : item.type}P
            </Amount>
            <DateText>{new Date(item.createdAt).toLocaleDateString()}</DateText>
          </HistoryItem>
        ))}
      </HistoryList>
    </Container>
  );
};

export default MySettingPoint;
