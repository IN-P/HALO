// components/AdminLayout.js
import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#fff' }}>
        <div style={{ padding: '20px', fontWeight: 'bold', fontSize: '20px' }}>
          🔧 관리자 메뉴
        </div>
        <Menu mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<UserOutlined />}>
            <Link href="/admin/users">유저 관리</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<FileTextOutlined />}>
            <Link href="/admin/logs">보안 로그</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<ToolOutlined />}>
            <Link href="/">메인으로</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ padding: '24px' }}>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
