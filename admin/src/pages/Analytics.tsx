import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Typography, Table, Tag, Space } from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  UserAddOutlined,
  EyeOutlined,
  LikeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalVisitors: number;
    totalLikes: number;
    avgViewsPerDay: number;
  };
  dailyStats: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
  topPosts: Array<{
    id: number;
    title: string;
    views: number;
    likes: number;
  }>;
  trafficSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData: AnalyticsData = {
        overview: {
          totalViews: 12456,
          totalVisitors: 3421,
          totalLikes: 892,
          avgViewsPerDay: 1779,
        },
        dailyStats: [
          { date: '2026-05-07', views: 1200, visitors: 320 },
          { date: '2026-05-08', views: 1450, visitors: 380 },
          { date: '2026-05-09', views: 1800, visitors: 450 },
          { date: '2026-05-10', views: 2100, visitors: 520 },
          { date: '2026-05-11', views: 1900, visitors: 480 },
          { date: '2026-05-12', views: 2300, visitors: 580 },
          { date: '2026-05-13', views: 1706, visitors: 411 },
        ],
        topPosts: [
          { id: 1, title: '如何使用 Astro 构建现代化博客', views: 2340, likes: 156 },
          { id: 2, title: 'React 18 新特性深度解析', views: 1890, likes: 123 },
          { id: 3, title: 'TypeScript 高级类型技巧', views: 1560, likes: 98 },
          { id: 4, title: 'Tailwind CSS 实战指南', views: 1320, likes: 87 },
          { id: 5, title: 'Node.js 性能优化实践', views: 1100, likes: 76 },
        ],
        trafficSources: [
          { source: '直接访问', count: 1234, percentage: 36.1 },
          { source: '搜索引擎', count: 1100, percentage: 32.2 },
          { source: '社交媒体', count: 678, percentage: 19.8 },
          { source: '外部链接', count: 409, percentage: 11.9 },
        ],
      };
      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const postColumns = [
    { title: '排名', dataIndex: 'index', key: 'index', width: 80, render: (_: any, __: any, index: number) => index + 1 },
    { title: '文章标题', dataIndex: 'title', key: 'title' },
    { title: '浏览量', dataIndex: 'views', key: 'views', render: (views: number) => <Tag color="blue">{views.toLocaleString()}</Tag> },
    { title: '点赞数', dataIndex: 'likes', key: 'likes', render: (likes: number) => <Tag color="green">{likes}</Tag> },
  ];

  const sourceColumns = [
    { title: '来源', dataIndex: 'source', key: 'source' },
    { title: '访问次数', dataIndex: 'count', key: 'count', render: (count: number) => count.toLocaleString() },
    { title: '占比', dataIndex: 'percentage', key: 'percentage', render: (percentage: number) => `${percentage.toFixed(1)}%` },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
        <Title level={4}>数据统计</Title>
        <Space>
          <RangePicker style={{ width: 300 }} />
          <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
            <Option value="7d">最近 7 天</Option>
            <Option value="30d">最近 30 天</Option>
            <Option value="90d">最近 90 天</Option>
            <Option value="1y">最近一年</Option>
          </Select>
        </Space>
      </Space>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="总浏览量"
              value={data?.overview.totalViews || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="独立访客"
              value={data?.overview.totalVisitors || 0}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="总点赞数"
              value={data?.overview.totalLikes || 0}
              prefix={<LikeOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="日均浏览"
              value={data?.overview.avgViewsPerDay || 0}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="热门文章" loading={loading} extra={<FileTextOutlined />}>
            <Table
              dataSource={data?.topPosts?.map((post, index) => ({ ...post, index }))}
              columns={postColumns}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="流量来源" loading={loading} extra={<BarChartOutlined />}>
            <Table
              dataSource={data?.trafficSources}
              columns={sourceColumns}
              pagination={false}
              rowKey="source"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;
