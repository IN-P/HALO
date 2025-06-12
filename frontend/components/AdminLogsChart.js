import React from 'react';
import { Card, Typography } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const { Title } = Typography;

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#D16587',
  '#8884D8', '#FF6666', '#33CCFF', '#FF99CC', '#FFB347',
];

const chartVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.3, duration: 0.6 },
  }),
};

const countByKey = (logs, key) => {
  const result = {};
  logs.forEach((log) => {
    const value = log[key]?.nickname || log[key]?.email || '기타';
    result[value] = (result[value] || 0) + 1;
  });
  return Object.entries(result).map(([name, value]) => ({ name, value }));
};

const AdminLogsChart = ({ logs }) => {
  const actionData = countByKey(logs, 'action');
  const userData = countByKey(logs, 'user');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
      {[{ title: '액션 분포', data: actionData }, { title: '실행자별 분포', data: userData }].map((chart, idx) => (
        <motion.div
          key={chart.title}
          custom={idx}
          initial="hidden"
          animate="visible"
          variants={chartVariants}
        >
          <Card bordered style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Title level={4}>{chart.title}</Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chart.data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chart.data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminLogsChart;
