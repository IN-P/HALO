import React from 'react';
import { Menu } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

const EventSidebar = () => {
  const router = useRouter();

  // 현재 경로에 따라 선택된 메뉴 키 설정
  const selectedKey = router.pathname.startsWith('/roulette')
    ? 'roulette'
    : 'quiz';

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      style={{ height: '100vh', width: 220, borderRight: 0 }}
    >
      <Menu.Item key="quiz">
        <Link href="/quiz">퀴즈</Link>
      </Menu.Item>
      <Menu.Item key="roulette">
        <Link href="/roulette">룰렛</Link>
      </Menu.Item>
    </Menu>
  );
};

export default EventSidebar;
