import React from 'react';
import { Menu } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

const InquirySidebar = () => {
  const router = useRouter();
  const selectedKey = router.pathname.includes('/inquiry/list')
    ? 'list'
    : router.pathname.includes('/inquiry') && router.query.id
    ? 'list'
    : 'write';

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      style={{ height: '100vh', width: 220, borderRight: 0 }}
    >
      <Menu.Item key="write">
        <Link href="/inquiry/inquiry">문의 작성</Link>
      </Menu.Item>
      <Menu.Item key="list">
        <Link href="/inquiry/InquiryListPage">문의 내역</Link>
      </Menu.Item>
    </Menu>
  );
};

export default InquirySidebar;
