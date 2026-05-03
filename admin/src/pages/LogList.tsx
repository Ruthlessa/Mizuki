import { useEffect, useState } from 'react';
import { Table, Select, DatePicker, Card, Row, Col, Statistic } from 'antd';
import { Bar } from '@ant-design/charts';
import { logService } from '../services/api';

const { RangePicker } = DatePicker;

interface Log {
  id: number;
  user_id: number;
  username: string;
  action: string;
  target_type: string;
  target_id: number;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const LogList = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [action, setAction] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = { page, pageSize };
      if (action) params.action = action;
      const response = await logService.getLogs(params);
      if (response.success) {
        setLogs(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await logService.getLogStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, pageSize, action]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户', dataIndex: 'username', key: 'username' },
    { title: '操作', dataIndex: 'action', key: 'action' },
    { title: '目标类型', dataIndex: 'target_type', key: 'target_type' },
    { title: 'IP', dataIndex: 'ip_address', key: 'ip_address' },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: (text: string) => new Date(text).toLocaleString('zh-CN') },
  ];

  const actionChartData = stats?.actionStats?.map((item: any) => ({
    action: item.action,
    count: item.count,
  })) || [];

  const userChartData = stats?.userStats?.map((item: any) => ({
    username: item.username || 'System',
    count: item.count,
  })) || [];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>操作日志</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="操作类型统计">
            {actionChartData.length > 0 && (
              <Bar
                data={actionChartData}
                xField="action"
                yField="count"
                height={200}
              />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="用户操作统计">
            {userChartData.length > 0 && (
              <Bar
                data={userChartData}
                xField="username"
                yField="count"
                height={200}
              />
            )}
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="筛选操作类型"
          allowClear
          style={{ width: 200 }}
          onChange={(value) => { setAction(value || ''); setPage(1); }}
          options={[
            { value: 'LOGIN', label: '登录' },
            { value: 'REGISTER', label: '注册' },
            { value: 'CREATE_USER', label: '创建用户' },
            { value: 'UPDATE_USER', label: '更新用户' },
            { value: 'DELETE_USER', label: '删除用户' },
            { value: 'CREATE_POST', label: '创建文章' },
            { value: 'UPDATE_POST', label: '更新文章' },
            { value: 'DELETE_POST', label: '删除文章' },
            { value: 'UPDATE_COMMENT', label: '更新评论' },
            { value: 'DELETE_COMMENT', label: '删除评论' },
            { value: 'UPDATE_SETTING', label: '更新设置' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />
    </div>
  );
};

export default LogList;
