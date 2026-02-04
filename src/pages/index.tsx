import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Menu, Avatar, Empty, Spin, Anchor, ConfigProvider, Row, Col, Card, Typography, Divider } from 'antd';
import { UserOutlined, HomeOutlined, CalendarOutlined, FileWordOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import FileSidebar from './Compoent'; 
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import './markdown-styles.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { Text } = Typography;

type fileType = {
  filename: string;
  date: string;
  author: string;
  path: string;
}

interface TocItem {
  key: string;
  href: string;
  title: string;
  level: number;
  children?: TocItem[];
}

export default function RedesignedPage() {
  const [currentKey, setCurrentKey] = useState('home');
  const [currentNote, setCurrentNote] = useState<fileType | null>(null);
  const randomBgId = useMemo(() => Math.floor(Math.random() * 10) + 1, []);
  const [notes, setNotes] = useState<{ [key: string]: any }>({});
  const [mdContent, setMdContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Use ref for the specific markdown content area now, not the whole column
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Read file content
  useEffect(() => {
    if (currentKey === 'home' || !currentNote) {
      setMdContent('');
      return;
    }

    const fetchNoteContent = async () => {
      setLoading(true);
      try {
        const res = await fetch(currentNote.path);
        if (res.ok) {
          const text = await res.text();
          setMdContent(text);
        } else {
          setMdContent('# 读取失败\n无法加载该文件。');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNoteContent();
  }, [currentNote, currentKey]);

  // 2. Generate TOC (Tree structure)
  const tocItems = useMemo(() => {
    if (!mdContent) return [];

    const lines = mdContent.split('\n');
    const flatItems: TocItem[] = [];
    let insideCodeBlock = false;

    const reg = /^(#{1,6})\s+(.+)$/;

    lines.forEach((line, index) => {
      if (line.trim().startsWith('```')) {
        insideCodeBlock = !insideCodeBlock;
        return;
      }
      if (insideCodeBlock) return;

      const match = line.match(reg);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-\u4e00-\u9fa5]/g, '');

        flatItems.push({
          key: `${id}-${index}`,
          href: `#${id}`,
          title: text,
          level: level,
          children: []
        });
      }
    });

    const root: TocItem[] = [];
    const stack: { level: number, children: TocItem[] }[] = [];
    stack.push({ level: 0, children: root });

    flatItems.forEach(item => {
      while (stack.length > 1 && item.level <= stack[stack.length - 1].level) {
        stack.pop();
      }
      const parent = stack[stack.length - 1];
      const newItem: TocItem = { ...item, children: [] };
      parent.children.push(newItem);
      stack.push({ level: item.level, children: newItem.children! });
    });

    return root;
  }, [mdContent]);

  // 3. Read notes list
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/notes-list.json');
        if (!response.ok) throw new Error('网络请求失败');
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error('无法读取 notes-list.json:', error);
      }
    };
    fetchNotes();
  }, []);

  // 4. Menu logic
  useEffect(() => {
    if (currentKey !== "home" && notes[currentKey] && notes[currentKey].length > 0) {
      setCurrentNote(notes[currentKey][0]);
    } else {
      setCurrentNote(null);
    }
  }, [currentKey, notes]);

  const menuItems: MenuProps['items'] = useMemo(() => {
    const staticItems = [{ key: 'home', label: '首页', icon: <HomeOutlined /> }];
    const dynamicItems = Object.keys(notes).map((dirName) => ({
      key: dirName,
      label: dirName,
    }));
    return [...staticItems, ...dynamicItems];
  }, [notes]);

  const handleFileClick = (file: fileType) => {
    setCurrentNote(file)
  };

  // --- Layout Components ---

  const TopBannerSection = (
    <div style={{
      height: '15vh',
      flexShrink: 0,
      position: 'relative',
      width: '100%',
      zIndex: 10
    }}>
      <img
        src="/img/upper.jpg"
        alt="Top Banner"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.5 }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).parentElement!.style.background = '#001529';
        }}
      />
      <div style={{ position: 'absolute', top: 15, right: 40, zIndex: 11 }}>
        <Avatar
          size={120}
          src="/img/avatar.jpg"
          icon={<UserOutlined />}
          style={{ border: '3px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
        />
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(2px)'
      }}>
        <Menu
          mode="horizontal"
          selectedKeys={[currentKey]}
          onClick={(e) => setCurrentKey(e.key)}
          items={menuItems}
          style={{ justifyContent: 'center', borderBottom: 'none', background: 'transparent', lineHeight: '48px' }}
        />
      </div>
    </div>
  );

  const MainContentSection = (
    <div style={{
      flex: 1,
      height: 0,
      width: '100%',
      backgroundImage: `url(/img/background_${randomBgId}.jpg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)' }} />

      <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: '20px 0' }}>
        <Row style={{ height: '100%', width: '100%', margin: 0 }}>
          <Col span={1} />
          <Col span={22} style={{ height: '100%' }}>
            <Row gutter={20} style={{ height: '100%' }}>

              {/* Left Sidebar */}
              <Col span={4} style={{ height: '100%' }}>
                <Card style={{ height: "100%", backgroundColor: 'rgba(255, 255, 255, 0.6)', border: 'none' }} bodyStyle={{ height: '100%', padding: 10 }}>
                  {currentKey === 'home' ? (
                     <Empty description="请选择分类" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{marginTop: '50%'}} />
                  ) : (
                    <FileSidebar
                      fileList={notes[currentKey]}
                      onFileClick={handleFileClick}
                    />
                  )}
                </Card>
              </Col>

              {/* Center Content Area */}
              <Col
                span={16}
                style={{ 
                  height: '100%', 
                  padding: '0 24px', 
                  // Use Flexbox here to separate Header (fixed) and Content (scrollable)
                  display: 'flex', 
                  flexDirection: 'column' 
                }}
              >
                {currentKey === 'home' ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Empty description={<span style={{fontSize: 18}}>欢迎回到知识库</span>} />
                  </div>
                ) : (
                  loading ? (
                    <div style={{ textAlign: 'center', marginTop: 100 }}><Spin tip="加载中..." /></div>
                  ) : mdContent ? (
                    // This container acts as the paper sheet
                    <div style={{ 
                        background: 'rgba(255,255,255,0.95)', // Increased opacity for better contrast/resolution feel
                        borderRadius: '8px', 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)' // Subtle shadow for depth
                    }}>
                      
                      {/* === Fixed Header === */}
                      <div style={{ 
                          padding: '24px 40px 0 40px', // Padding top/left/right
                          flexShrink: 0,
                          borderBottom: '1px solid #f0f0f0' 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#555', fontSize: '15px', fontWeight: 500 }}>
                          <span>
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            {currentNote?.date || '未知日期'}
                          </span>
                          <span>
                            <UserOutlined style={{ marginRight: 8 }} />
                            {currentNote?.author || '未知作者'}
                          </span>
                        </div>
                      </div>

                      {/* === Scrollable Markdown Content === */}
                      <div 
                        ref={scrollContainerRef} // Scroll listener is now here
                        style={{ 
                            flex: 1, 
                            overflowY: 'auto', 
                            padding: '24px 40px', // Padding for content
                            scrollBehavior: 'smooth' 
                        }}
                      >
                        <div className="markdown-body">
                          <ReactMarkdown 
                            rehypePlugins={[rehypeSlug]}
                            components={{
                              code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    {...props}
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    showLineNumbers={true}
                                    wrapLines={true}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {mdContent}
                          </ReactMarkdown>
                        </div>

                        <Divider style={{ margin: '40px 0 20px 0' }} />

                        {/* Footer stays at the bottom of the scrollable content */}
                        <div style={{ textAlign: 'right', color: '#999', fontSize: '13px' }}>
                           <FileWordOutlined style={{ marginRight: 6 }} />
                           本篇共 {mdContent.replace(/\s+/g, '').length} 字
                        </div>
                      </div>

                    </div>
                  ) : (
                    <Empty description="请在左侧选择一篇文章" style={{ marginTop: '20vh' }} />
                  )
                )}
              </Col>

              {/* Right Sidebar: TOC */}
              <Col span={4} style={{ height: '100%' }}>
                <Card
                  title="文章大纲"
                  size="small"
                  style={{ height: "100%", overflowY: 'auto', backgroundColor: 'rgba(255, 255, 255, 0.6)', border: 'none' }}
                  bodyStyle={{ padding: '10px 0' }}
                >
                  {currentKey !== 'home' && tocItems.length > 0 ? (
                    <Anchor
                      items={tocItems}
                      getContainer={() => scrollContainerRef.current!}
                      offsetTop={20}
                      targetOffset={20}
                      style={{ fontSize: '12px', background: 'transparent' }}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ marginTop: '10vh' }}
                      description={<span style={{ fontSize: 14, color: '#999' }}>
                         {currentKey === 'home' ? "等待选择" : "暂无大纲"}
                      </span>}
                    />
                  )}
                </Card>
              </Col>

            </Row>
          </Col>
          <Col span={1} />
        </Row>
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', // Ensure system fonts are used
        },
        components: {
          Menu: { fontSize: 18, itemColor: 'black', itemSelectedColor: '#1890ff', itemHoverColor: '#1890ff', activeBarHeight: 4 },
        },
      }}
    >
      <div style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {TopBannerSection}
        {MainContentSection}
      </div>
    </ConfigProvider>
  );
}