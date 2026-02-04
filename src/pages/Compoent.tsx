import React from 'react';
import { Card, List, Empty, Typography, Avatar, Space } from 'antd';
import { FileTextTwoTone, CalendarOutlined, UserOutlined } from '@ant-design/icons';

// 引入 Title 组件
const { Text, Title } = Typography;

type fileType = {
  filename: string;
  date: string;
  author: string;
  path: string;
}

interface FileListInput {
  fileList?: fileType[];
  onFileClick?: (file: fileType) => void;
}

const FileSidebar: React.FC<FileListInput> = ({ fileList, onFileClick }) => {

  return (
    // 外层容器：Flex 布局，确保高度占满
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. 顶部标题区域 (固定不动) */}
      <div style={{ padding: '0 4px 16px 4px' }}>
        <Title level={4} style={{ margin: 0, color: '#333' }}>
          笔记列表
        </Title>
      </div>

      {/* 2. 列表区域 (可滚动) */}
      <div style={{ flex: 1, overflow: 'hidden' }}> 
        <Card 
          style={{ height: "100%", border: 'none', background: 'transparent' }} 
          // 列表内容区域：overflowY: 'auto' 负责滚动
          bodyStyle={{ padding: '0 4px 10px 4px', height: '100%', overflowY: 'auto' }}
        >
          {(!fileList || fileList.length === 0) ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: '10vh' }}
              description={<span style={{ color: '#999' }}>暂无文章</span>}
            />
          ) : (
            <List
              split={false}
              dataSource={fileList}
              renderItem={(item) => (
                <List.Item style={{ padding: 0, marginBottom: '16px' }}> 
                  <Card
                    hoverable
                    size="small"
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px', 
                      border: '1px solid #f0f0f0' 
                    }}
                    onClick={() => {
                      if (onFileClick) {
                        onFileClick(item);
                      }
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <Text strong style={{ fontSize: '18px' }}>
                          {item.filename || '未命名文件'}
                        </Text>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default FileSidebar;