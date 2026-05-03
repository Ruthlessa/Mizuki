import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Select, message } from 'antd';
import { CheckOutlined, DeleteOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { commentService } from '../services/api';

interface Comment {
  id: number;
  post_id: number;
  post_title: string;
  author: string;
  content: string;
  email: string;
  status: 'pending' | 'approved' | 'spam';
  created_at: string;
}

const CommentList = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getComments({ page, pageSize });
      if (response.success) {
        setComments(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, pageSize]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await commentService.updateCommentStatus(id, status);
      if (response.success) {
        message.success('状态更新成功');
        fetchComments();
      }
    } catch (error: any) {
      message.error(error.message || '更新失败');
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      onOk: async () => {
        try {
          const response = await commentService.deleteComment(id);
          if (response.success) {
            message.success('删除成功');
            fetchComments();
          }
        } catch (error: any) {
          message.error(error.message || '删除失败');
        }
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '文章', dataIndex: 'post_title', key: 'post_title', ellipsis: true },
    { title: '评论者', dataIndex: 'author', key: 'author' },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, { color: string; label: string }> = {
          pending: { color: 'orange', label: '待审核' },
          approved: { color: 'green', label: '已通过' },
          spam: { color: 'red', label: '垃圾' },
        };
        return <Tag color={config[status].color}>{config[status].label}</Tag>;
      },
    },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: (text: string) => new Date(text).toLocaleString('zh-CN') },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Comment) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button type="link" icon={<CheckOutlined />} onClick={() => handleStatusChange(record.id, 'approved')}>
                通过
              </Button>
              <Button type="link" icon={<CloseCircleOutlined />} onClick={() => handleStatusChange(record.id, 'spam')}>
                标记垃圾
              </Button>
            </>
          )}
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>评论管理</h2>
      <Table
        columns={columns}
        dataSource={comments}
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

export default CommentList;
