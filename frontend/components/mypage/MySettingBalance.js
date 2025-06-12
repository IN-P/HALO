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
  color: #a0aec0;  // 연한 색
  font-size: 12px;
  margin-bottom: 4px;
`;

const TypeText = styled.div`
  margin-top: 0;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
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

const MySettingBalance = ({ user, data }) => {
  const balance = user?.balance || 0;
  const formattedBalance = balance.toLocaleString();

  const paymentHistory = data?.UserPayments || [];

  const renderType = (status) => {
    switch (status) {
      case 1: return '충전';
      case 2: return '실패';
      case 3: return '취소';
      default: return '알 수 없음';
    }
  };

  // 1. 날짜 오름차순 정렬 (누적 계산용)
  const historyAsc = [...paymentHistory].sort((a, b) =>
    new Date(a.paid_at) - new Date(b.paid_at)
  );

  // 2. 누적 잔액 계산
  let cumulative = 0;
  const withBalanceAsc = historyAsc.map(item => {
    if (item.status === 1) {
      cumulative += item.amount;
    }
    return { ...item, calculatedBalance: item.status === 1 ? cumulative : null };
  });

  // 3. 날짜 내림차순 정렬 (출력용)
  const withBalanceDesc = [...withBalanceAsc].sort((a, b) =>
    new Date(b.paid_at) - new Date(a.paid_at)
  );

  // 날짜 포맷팅 함수
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const pad = (num) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <BalanceWrapper>
      <BalanceTitle>현재 잔액</BalanceTitle>
      <BalanceAmount>{formattedBalance}원</BalanceAmount>

      <HistoryTitle>거래 내역</HistoryTitle>
      {withBalanceDesc.length === 0 ? (
        <EmptyMessage>거래 내역이 없습니다.</EmptyMessage>
      ) : (
        <HistoryList>
          {withBalanceDesc.map((item) => (
            <HistoryItem key={item.id}>
              <InfoGroup>
                <TypeText>{renderType(item.status)}</TypeText>
                <DateText>{item.paid_at ? formatDateTime(item.paid_at) : ''}</DateText>
              </InfoGroup>
              <AmountText type={item.status === 1 ? 'plus' : 'minus'}>
                {item.status === 1 ? '+' : ''}
                {item.amount.toLocaleString()}원
              </AmountText>
              <BalanceText>
                {item.status === 1 ? `${item.calculatedBalance.toLocaleString()}원` : '–'}
              </BalanceText>
            </HistoryItem>
          ))}
        </HistoryList>
      )}
    </BalanceWrapper>
  );
};

export default MySettingBalance;
