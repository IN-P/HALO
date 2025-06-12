import React from 'react';
import { Menu } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

const EventAdminSidebar = () => {
  const router = useRouter();

  const selectedKey = router.pathname.includes('/admin/quiz')
    ? 'quiz'
    : 'roulette';

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      style={{ height: '100vh', width: 220, borderRight: 0 }}
    >
      <Menu.Item key="roulette">
        <Link href="/admin/event/roulette">룰렛 참여</Link>
      </Menu.Item>
      <Menu.Item key="quiz">
        <Link href="/admin/quiz/index">퀴즈 참여</Link>
      </Menu.Item>
    </Menu>
  );
};

export default EventAdminSidebar;
