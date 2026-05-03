import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, List, Typography, Space } from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  CommentOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { settingService } from '../services/api';

const { Title, Text } = Typography;

interface DashboardStats {
  posts: { total: number; published: number };
  users: { total: number };
  comments: { total: number; pending: number };
  logs: { total: number };
  recentPosts: any[];
  recentLogs: any[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await settingService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const logColumns = [
    { title: '用户', dataIndex: 'username', key: 'username' },
    { title: '操作', dataIndex: 'action', key: 'action' },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: (text: string) => new Date(text).toLocaleString('zh-CN') },
  ];

  return (
    <div>
      <Title level={4}>仪表盘</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="文章总数"
              value={stats?.posts.total || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="用户总数"
              value={stats?.users.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="评论总数"
              value={stats?.comments.total || 0}
              prefix={<CommentOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="待审核评论"
              value={stats?.comments.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="最新文章" loading={loading}>
            <List
              dataSource={stats?.recentPosts || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <Space>
                        <Tag color={item.status === 'published' ? 'green' : 'orange'}>{item.status === 'published' ? '已发布' : '草稿'}</Tag>
                        <Text type="secondary">{item.author}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最新操作" loading={loading}>
            <List
              dataSource={stats?.recentLogs || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.action}
                    description={item.username || '系统'}
                  />
                  <Text type="secondary">{new Date(item.created_at).toLocaleString('zh-CN')}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
