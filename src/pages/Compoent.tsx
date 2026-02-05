import {useState} from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './markdown-styles.css';
import React from 'react';
import {List, Typography, Spin, Image, Divider, Empty, Space, Tag, Tooltip, Anchor, Menu, Avatar, } from 'antd';
import { 
  CalendarOutlined, 
  CopyOutlined,
  UserOutlined, 
  CheckOutlined,
  FolderOpenOutlined,
  FileTextOutlined, 
  ClockCircleOutlined,
  ReadOutlined, 
  GithubOutlined, 
  MailOutlined, 
  LinkOutlined,
  CompassOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import { UnorderedListOutlined } from '@ant-design/icons';
const { Text, Title } = Typography;
import type { MenuProps } from 'antd';

// --- 类型定义 ---
type FileType = {
  filename: string;
  date: string; 
  author: string;
  path: string;
};

interface FileListInput {
  fileList?: FileType[];
  onFileClick?: (file: FileType) => void;
  // 新增：接收当前选中的文件，用于高亮显示
  currentFile?: FileType | null; 
}


// 左侧文件列表栏
const FileSidebar: React.FC<FileListInput> = ({ fileList, onFileClick, currentFile }) => {

  return (
    <div className="glass-panel" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      padding: '12px',
      background: 'rgba(255, 255, 255, 0.65)' 
    }}>
      
      {/* 标题区域 */}
      <div style={{ 
        padding: '8px 4px 16px 4px', 
        borderBottom: '1px solid rgba(0,0,0,0.06)', 
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={5} style={{ margin: 0, color: '#444', fontWeight: 600, fontSize: '18px' }}>
            <FolderOpenOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            笔记列表
          </Title>
          <Tag color="blue" style={{ marginRight: 0, borderRadius: 10, border: 'none', background: 'rgba(24,144,255,0.1)', color: '#1890ff' }}>
            {fileList?.length || 0} 篇
          </Tag>
        </div>
      </div>

      {/* 列表区域 */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar"> 
        {(!fileList || fileList.length === 0) ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: '50%', opacity: 0.5, transform: 'scale(0.9)' }}
            description={<span style={{ color: '#aaa', fontSize: 13 }}>暂无笔记</span>}
          />
        ) : (
          <List
            dataSource={fileList}
            split={false}
            renderItem={(item) => {
              const isSelected = currentFile?.path === item.path;
              return (
                <List.Item style={{ padding: 0, marginBottom: '8px' }}>
                  <div
                    onClick={() => onFileClick && onFileClick(item)}
                    style={{
                      // 1. 开启相对定位，为了让内部的指示条绝对定位
                      position: 'relative', 
                      width: '100%',
                      cursor: 'pointer',
                      // 2. 左侧内边距加大到 24px，给指示条留出位置，避免文字重叠
                      padding: '12px 14px 12px 24px', 
                      borderRadius: '8px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // 更顺滑的动画
                      backgroundColor: isSelected ? '#fff' : 'transparent',
                      // 选中时增加轻微阴影
                      boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                      // 选中时整体轻微上浮
                      transform: isSelected ? 'translateY(-1px)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* --- 核心修改：左侧选中指示条 (Indicator) --- */}
                    <div style={{
                      position: 'absolute',
                      left: '6px',             // 距离左边 6px，有一点悬浮感
                      top: '50%',              // 垂直居中
                      transform: isSelected 
                        ? 'translateY(-50%) scaleY(1)'  // 选中：正常显示
                        : 'translateY(-50%) scaleY(0)', // 未选中：缩为0 (动画隐藏)
                      width: '4px',            // 指示条宽度
                      height: '60%',           // 指示条高度（占卡片的60%）
                      borderRadius: '4px',     // 全圆角
                      backgroundColor: '#1890ff', // 清新的蓝色
                      opacity: isSelected ? 1 : 0,
                      transition: 'all 0.3s ease', // 动画过渡
                    }} />

                    {/* 内容部分 */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <FileTextOutlined style={{ 
                        fontSize: '16px', 
                        marginRight: 8, 
                        color: isSelected ? '#1890ff' : '#888',
                        transition: 'color 0.3s'
                      }} />
                      <Text ellipsis style={{ 
                        fontSize: '16px', 
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? '#333' : '#555',
                        flex: 1,
                        transition: 'color 0.3s'
                      }}>
                        {item.filename.replace('.md', '')}
                      </Text>
                    </div>

                    <div style={{ paddingLeft: 22 }}>
                      <Text type="secondary" style={{ fontSize: '11px', color: '#999' }}>
                        <ClockCircleOutlined style={{ fontSize: '10px', marginRight: 4 }} />
                        {item.date || 'Unknown'}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

// 带复制功能的块级代码组件
export const MarkdownCodeBlock = ({ children, language, ...props }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const codeString = String(children).replace(/\n$/, '');
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('无法复制: ', err);
    }
  };

  return (
    <div style={{ position: 'relative' }} className="code-block-wrapper">
      <div 
        onClick={handleCopy}
        className="copy-button" // 添加一个类名，方便 CSS 控制
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
          // 仅保留由 React 状态控制的动态颜色，其他的交给 CSS
          backgroundColor: copied ? 'rgba(82, 196, 26, 0.2)' : undefined, 
          border: `1px solid ${copied ? '#52c41a' : 'rgba(255, 255, 255, 0.3)'}`,
          color: copied ? '#52c41a' : '#fff',
          fontSize: '12px',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {copied ? <><CheckOutlined /> 已复制</> : <><CopyOutlined /> 复制</>}
      </div>
      <SyntaxHighlighter
        {...props}
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        showLineNumbers={true}
        wrapLines={true}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};


// 中间的阅读板块
interface NoteViewerProps {
  content: string;
  loading: boolean;
  currentNote: FileType | null;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const NoteViewer: React.FC<NoteViewerProps> = ({ content, loading, currentNote, scrollRef }) => {
  
  const wordCount = content ? content.replace(/\s+/g, '').length : 0;
  const readTime = Math.ceil(wordCount / 500);

  // --- 1. Loading 状态 ---
  if (loading) {
    return (
      <div className="glass-panel" style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'rgba(255,255,255,0.8)' 
      }}>
        <Spin size="large" />
        <div style={{ marginTop: 24, color: '#666', letterSpacing: 1 }}>正在翻阅笔记...</div>
      </div>
    );
  }

  // --- 2. Empty 状态 ---
  if (!content) {
    return (
      <div className="glass-panel" style={{ 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.6)'
      }}>
        <Empty 
          image="/img/empty-state.svg" // 建议找一个好看的 svg，或者使用默认
          imageStyle={{ height: 120, opacity: 0.5, marginBottom: 20 }}
          description={
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, color: '#555', marginBottom: 8, fontWeight: 500 }}>准备好学习了吗？</div>
              <div style={{ fontSize: 14, color: '#888' }}>请在左侧选择一篇笔记开始阅读</div>
            </div>
          } 
        />
      </div>
    );
  }

  // --- 3. Content 状态 ---
  return (
    <div className="glass-panel" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'rgba(255, 255, 255, 0.92)', // 提高不透明度，保证阅读体验
      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', // 柔和的大阴影
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* --- 文章元数据头部 --- */}
      <div style={{ 
        padding: '24px 40px 16px 40px', 
        borderBottom: '1px dashed #e8e8e8', // 虚线分割，更像笔记纸
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          {/* 左侧：作者与日期 */}
          <Space size="large" style={{ color: '#666', fontSize: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ marginRight: 6, color: '#1890ff' }} /> 
              {currentNote?.date || 'Unknown'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <UserOutlined style={{ marginRight: 6, color: '#52c41a' }} /> 
              {currentNote?.author || 'Anonymous'}
            </span>
          </Space>

          {/* 右侧：统计信息 */}
          <Space size="middle">
             <Tooltip title="预估阅读时间">
                <Tag color="cyan" icon={<ClockCircleOutlined />} style={{ border: 'none', background: '#e6fffb', color: '#006d75' }}>
                  {readTime} min read
                </Tag>
             </Tooltip>
             <Tag color="geekblue" style={{ border: 'none', background: '#f0f5ff', color: '#2f54eb' }}>
                {wordCount} 字
             </Tag>
          </Space>
        </div>
      </div>

      {/* --- Markdown 滚动区域 --- */}
      <div 
        ref={scrollRef} 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '32px 48px 60px 48px', // 底部留白多一点
          scrollBehavior: 'smooth' 
        }}
        className="custom-scrollbar" // 记得在 CSS 里定义滚动条样式
      >
        <div className="markdown-body clean-typography">
          <ReactMarkdown 
            rehypePlugins={[rehypeSlug]}
            components={{
              // 图片优化：增加圆角和阴影容器
              img: ({node, ...props}) => (
                <div className="md-image-wrapper">
                  <Image 
                    src={props.src} 
                    alt={props.alt}
                    style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    placeholder={<Spin />} // 图片加载时显示 loading
                  />
                  {props.alt && <div className="md-image-caption">{props.alt}</div>}
                </div>
              ),
              // 代码块逻辑保持不变
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '');
                if (!inline && match) {
                  return <MarkdownCodeBlock language={match[1]} children={children} {...props} />;
                }
                // 行内代码样式优化
                return (
                  <code className={className} style={{ 
                    background: 'rgba(0,0,0,0.04)', 
                    color: '#e83e8c', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontFamily: 'Consolas, Monaco, monospace'
                  }} {...props}>
                    {children}
                  </code>
                );
              },
              // 引用块优化
              blockquote: ({node, ...props}) => (
                <blockquote style={{ 
                  borderLeft: '4px solid #1890ff', 
                  background: '#f0f9ff', 
                  padding: '16px 20px', 
                  margin: '20px 0',
                  borderRadius: '0 8px 8px 0',
                  color: '#444',
                  fontStyle: 'italic'
                }} {...props} />
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* --- 底部结束语 --- */}
        <Divider plain style={{ margin: '60px 0 20px 0', color: '#ccc', fontSize: 12 }}>
          <ReadOutlined style={{ marginRight: 8 }} /> 
          End of Note
        </Divider>
      </div>
    </div>
  );
};


// 右侧的目录板块
interface TocItem {
  key: string;
  href: string;
  title: string;
  level: number;
  children?: TocItem[];
}

interface TocSidebarProps {
  items: TocItem[];
  containerRef: React.RefObject<HTMLDivElement>;
  hasContent: boolean; // 用于判断是否显示 Empty 状态
}

export const TocSidebar: React.FC<TocSidebarProps> = ({ items, containerRef, hasContent }) => {
  return (
    <div className="glass-panel" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '12px',
      background: 'rgba(255, 255, 255, 0.65)' 
    }}>
      
      {/* 1. 顶部标题 */}
      <div style={{ 
        padding: '8px 4px 16px 4px', 
        borderBottom: '1px solid rgba(0,0,0,0.06)', 
        marginBottom: '12px' 
      }}>
        <Title level={5} style={{ margin: 0, color: '#444', fontWeight: 600, fontSize: '18px' }}>
          <UnorderedListOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          笔记大纲
        </Title>
      </div>

      {/* 2. 目录内容区域 */}
      <div 
        className="custom-scrollbar"
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          paddingRight: '4px' 
        }}
      >
        {hasContent && items.length > 0 ? (
          <Anchor
            items={items}
            getContainer={() => containerRef.current!} // 绑定中间滚动区域
            affix={false} // 因为外层已经是固定高度布局，不需要 Anchor 自带的吸顶
            targetOffset={30} // 点击跳转时，距离顶部的偏移量，防止标题贴顶太紧
            style={{ 
              width: '100%', 
              backgroundColor: 'transparent' // 确保 Anchor 背景透明
            }}
          />
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            opacity: 0.5 
          }}>
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={<span style={{ color: '#aaa', fontSize: 13 }}>暂无目录</span>} 
            />
          </div>
        )}
      </div>
    </div>
  );
};


// 顶部的板块
interface SiteHeaderProps {
  currentKey: string;
  menuItems: MenuProps['items'];
  onMenuClick: (key: string) => void;
  avatarSrc?: string;
  title?: string;
  subtitle?: string;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ 
  currentKey, 
  menuItems, 
  onMenuClick, 
  avatarSrc = "/img/avatar.jpg",
  title = "个人笔记",
  subtitle = "正在导入模块《计算机网络（第5版）》，目前进度：404 Not Found。"
}) => {
  
  return (
    <div style={{ 
      position: 'relative', 
      zIndex: 10, 
      marginBottom: '20px', // 减小底部外边距，让正文更靠上
      backgroundColor: '#f5f7fa',
    }}>
      
      {/* 1. 背景区域：高度减小，颜色变深 */}
      <div style={{ 
        height: '150px', 
        width: '100%',
        // 痛点解决：颜色改为“深海蓝灰”渐变，沉稳不刺眼
        background: 'linear-gradient(135deg, #3a6073 0%, #3a7bd5 100%)', 
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        
        {/* 痛点解决：背景增加微弱的“点阵纹理”，防止单调 */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.6
        }} />

        {/* 装饰性光斑 */}
        <div style={{ position: 'absolute', top: -50, right: '10%', width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />

        {/* 2. 左侧内容：标题 + 社交图标 */}
        <div style={{ 
          position: 'absolute', 
          top: '45%', 
          left: '40px', // 稍微靠左，适应小屏幕
          transform: 'translateY(-50%)', 
          zIndex: 12,
        }}>
           <div style={{ display: 'flex', flexDirection: 'column' }}>
             {/* 标题 */}
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8, marginRight: 12, display: 'flex' }}>
                   <ReadOutlined style={{ color: '#fff', fontSize: 20 }} />
                </div>
                <div>
                   <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 700, lineHeight: 1, letterSpacing: 1 }}>
                      {title}
                   </Title>
                   <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, display: 'block', fontWeight: 300 }}>
                      {subtitle}
                   </Text>
                </div>
             </div>
           </div>
        </div>

        {/* 3. 右侧内容：头像 + 个性签名/统计 */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          right: '60px', 
          transform: 'translateY(-50%)',
          zIndex: 11,
          display: 'flex',
          alignItems: 'center'
        }}>
          <div 
            className="glass-panel motto-bubble" // 
            style={{ 
                marginRight: 20, 
                padding: '8px 16px', 
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
            }}
          >
              <span style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
                <CompassOutlined style={{ marginRight: 6 }} /> 
                KuHuSu 试图在 <span style={{ color: '#ff4d4f' }}>内存泄漏</span> 里游泳
              </span>
          </div>

          {/* 头像 */}
          <Avatar
            size={120} 
            src={avatarSrc}
            icon={<UserOutlined />}
            style={{ 
              border: '3px solid rgba(255,255,255,0.9)', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* 4. 底部波浪装饰 (SVG Wave) - 增加灵动感 */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', lineHeight: 0, opacity: 0.3 }}>
           <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '60px', width: '100%' }}>
              <path fill="#ffffff" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           </svg>
        </div>
      </div>

      {/* 5. 悬浮导航栏：进一步压缩尺寸，向上侵入 Banner */}
      <div style={{
        marginTop: '-30px', // 向上偏移，压在波浪上
        display: 'flex',
        justifyContent: 'center',
        zIndex: 20,
        padding: '0 20px',
        position: 'relative' // 确保层级
      }}>
        <div className="glass-panel" style={{
          padding: '0 24px',
          borderRadius: '12px', // 改为圆角矩形，更像一个 Dock 栏
          height: '52px', // 高度减小
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
          background: 'rgba(255, 255, 255, 0.95)', // 几乎不透明，保证文字清晰
          minWidth: '320px',
          border: '1px solid #fff',
          width: 'fit-content', // 核心修改：让容器宽度根据内容自适应！
          maxWidth: '100%',     // 防止超出屏幕
        }}>
          <Menu
            mode="horizontal"
            selectedKeys={[currentKey]}
            disabledOverflow={true}
            onClick={(e) => onMenuClick(e.key)}
            items={menuItems}
            style={{ 
              borderBottom: 'none', 
              background: 'transparent', 
              width: '100%',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '52px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

// 辅助组件：社交图标
const SocialLink = ({ icon, href, tooltip }: { icon: React.ReactNode, href: string, tooltip: string }) => (
  <Tooltip title={tooltip}>
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer" 
      style={{ 
        color: 'rgba(255,255,255,0.85)', 
        fontSize: '18px', 
        transition: 'all 0.3s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
    >
      {icon}
    </a>
  </Tooltip>
);

export default FileSidebar;