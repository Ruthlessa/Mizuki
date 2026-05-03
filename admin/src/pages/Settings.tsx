import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, List, Tag, Space, Popconfirm } from 'antd';
import { settingService } from '../services/api';

interface Setting {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  postsPerPage: string;
  enableComment: string;
  maintenanceMode: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingService.getSettings();
      if (response.success) {
        setSettings(response.data);
        form.setFieldsValue(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      for (const [key, value] of Object.entries(values)) {
        await settingService.updateSetting(key, value as string);
      }
      message.success('设置保存成功');
      fetchSettings();
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const commonSettings = [
    { key: 'siteName', label: '网站名称', placeholder: 'Mizuki', description: '博客网站的名称' },
    { key: 'siteDescription', label: '网站描述', placeholder: '一个简洁的博客', description: '显示在网站描述中' },
    { key: 'siteUrl', label: '网站地址', placeholder: 'https://example.com', description: '博客的完整 URL' },
  ];

  const postSettings = [
    { key: 'postsPerPage', label: '每页文章数', placeholder: '10', description: '文章列表每页显示的数量' },
    { key: 'enableComment', label: '开启评论', placeholder: 'true/false', description: '是否启用评论功能' },
  ];

  const systemSettings = [
    { key: 'maintenanceMode', label: '维护模式', placeholder: 'false', description: '开启后网站将显示维护中' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统设置</h2>

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {commonSettings.map((setting) => (
              <Form.Item
                key={setting.key}
                name={setting.key}
                label={setting.label}
                extra={setting.description}
              >
                <Input placeholder={setting.placeholder} />
              </Form.Item>
            ))}
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="文章设置" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {postSettings.map((setting) => (
              <Form.Item
                key={setting.key}
                name={setting.key}
                label={setting.label}
                extra={setting.description}
              >
                <Input placeholder={setting.placeholder} />
              </Form.Item>
            ))}
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="系统设置" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {systemSettings.map((setting) => (
              <Form.Item
                key={setting.key}
                name={setting.key}
                label={setting.label}
                extra={setting.description}
              >
                <Input placeholder={setting.placeholder} />
              </Form.Item>
            ))}
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
