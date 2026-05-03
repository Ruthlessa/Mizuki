import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, InputNumber, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { postService } from '../services/api';

interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author_name: string;
  created_at: string;
}

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getPosts({ page, pageSize });
      if (response.success) {
        setPosts(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, pageSize]);

  const handleAdd = () => {
    setEditingPost(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    form.setFieldsValue({ ...post, tags: post.tags ? JSON.parse(post.tags as any) : [] });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇文章吗？',
      onOk: async () => {
        try {
          const response = await postService.deletePost(id);
          if (response.success) {
            message.success('删除成功');
            fetchPosts();
          }
        } catch (error: any) {
          message.error(error.message || '删除失败');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingPost) {
        await postService.updatePost(editingPost.id, values);
        message.success('更新成功');
      } else {
        await postService.createPost(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchPosts();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '分类', dataIndex: 'category', key: 'category' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = { published: 'green', draft: 'orange', archived: 'gray' };
        const labels: Record<string, string> = { published: '已发布', draft: '草稿', archived: '归档' };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    { title: '作者', dataIndex: 'author_name', key: 'author_name' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (text: string) => new Date(text).toLocaleString('zh-CN') },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Post) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>文章管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          创建文章
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />
      <Modal
        title={editingPost ? '编辑文章' : '创建文章'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'draft' }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select>
                  <Select.Option value="draft">草稿</Select.Option>
                  <Select.Option value="published">已发布</Select.Option>
                  <Select.Option value="archived">归档</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="slug" label="别名">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="分类">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="内容">
            <Input.TextArea rows={10} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostList;
