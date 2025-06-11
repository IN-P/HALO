import React from 'react';
import styled from 'styled-components';

const BalanceWrapper = styled.div`
  padding: 40px 32px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  max-width: 800px;
  margin: 40px auto;
  font-family: 'Apple SD Gothic Neo', sans-serif;
`;

const BalanceTitle = styled.div`
  font-size: 18px;
  color: #64748b;
  margin-bottom: 10px;
`;

const BalanceAmount = styled.div`
  font-size: 40px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 32px;
`;

const HistoryTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #334155;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-radius: 14px;
  background: #f9fafb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  color: #475569;
  font-size: 14px;
  min-width: 100px;
`;

const DateText = styled.div`
  font-weight: 600;
  color: #334155;
`;

const TypeText = styled.div`
  margin-top: 4px;
`;

const AmountText = styled.div`
  font-weight: 700;
  color: ${props => (props.type === 'plus' ? '#2563eb' : '#dc2626')};
  min-width: 110px;
  text-align: right;
`;

const BalanceText = styled.div`
  font-weight: 600;
  color: #334155;
  min-width: 110px;
  text-align: right;
`;

const EmptyMessage = styled.div`
  padding: 40px 0;
  text-align: center;
  color: #cbd5e1;
  font-size: 16px;
`;

const MySettingBalance = ({ user }) => {
  
  const balance = user?.balance;
  const formattedBalance = balance.toLocaleString();

  const history = [
    { id: 1, date: '2025-06-10', type: '충전', amount: 5000, balance: 6000 },
    { id: 2, date: '2025-06-09', type: '사용', amount: -2000, balance: 1000 },
    { id: 3, date: '2025-06-08', type: '충전', amount: 3000, balance: 3000 },
  ];

  return (
    <BalanceWrapper>
      <BalanceTitle>현재 잔액</BalanceTitle>
      <BalanceAmount>{formattedBalance}원</BalanceAmount>

      <HistoryTitle>거래 내역</HistoryTitle>
      {history.length === 0 ? (
        <EmptyMessage>거래 내역이 없습니다.</EmptyMessage>
      ) : (
        <HistoryList>
          {history.map(item => (
            <HistoryItem key={item.id}>
              <InfoGroup>
                <DateText>{item.date}</DateText>
                <TypeText>{item.type}</TypeText>
              </InfoGroup>
              <AmountText type={item.amount > 0 ? 'plus' : 'minus'}>
                {item.amount > 0 ? '+' : ''}
                {item.amount.toLocaleString()}원
              </AmountText>
              <BalanceText>{item.balance.toLocaleString()}원</BalanceText>
            </HistoryItem>
          ))}
        </HistoryList>
      )}
    </BalanceWrapper>
  );
};

export default MySettingBalance;


// 1 성공 2 실패 3 취소