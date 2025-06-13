import React from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const PointBox = styled.div`
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const PointLabel = styled.div`
  font-size: 18px;
  color: #666;
`;

const PointValue = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: #333;
`;

const HistoryTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 12px;
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
`;

const HistoryItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
`;

const Type = styled.span`
  flex: 1;
  color: ${(props) => (props.$isPlus ? "#2e8b57" : "#d9534f")};
  font-weight: bold;
`;

const Amount = styled.span`
  flex: 1;
  text-align: right;
  color: ${(props) => (props.$isPlus ? "#2e8b57" : "#d9534f")};
`;

const Date = styled.span`
  flex: 1;
  text-align: right;
  color: #999;
  font-size: 14px;
`;


// 더미 데이터 (예시)
const pointHistory = [
  { id: 1, type: "적립", amount: 1000, date: "2025-06-01" },
  { id: 2, type: "사용", amount: -500, date: "2025-06-03" },
  { id: 3, type: "적립", amount: 2000, date: "2025-06-10" },
];

const MySettingPoint = () => {
  const totalPoint = pointHistory.reduce((acc, item) => acc + item.amount, 0);

  return (
    <Container>
      <Title>나의 포인트</Title>
      <PointBox>
        <PointLabel>보유 포인트</PointLabel>
        <PointValue>{totalPoint.toLocaleString()}P</PointValue>
      </PointBox>

      <HistoryTitle>포인트 내역</HistoryTitle>
      <HistoryList>
        {pointHistory.map((item) => (
          <HistoryItem key={item.id}>
            <Type $isPlus={item.amount > 0}>{item.type}</Type>
            <Amount $isPlus={item.amount > 0}>
              {item.amount > 0 ? `+${item.amount}` : item.amount}P
            </Amount>
            <Date>{item.date}</Date>
          </HistoryItem>
        ))}
      </HistoryList>
    </Container>
  );
};

export default MySettingPoint;
