import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Menu, Avatar, Empty, Spin, Anchor, ConfigProvider, Row, Col, Card, Typography, Divider, Image } from 'antd';
import { UserOutlined, HomeOutlined, CalendarOutlined, FileWordOutlined, ReadOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import FileSidebar, { TocSidebar, NoteViewer, SiteHeader } from './Compoent'; 
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import { HomePage } from './HomePage';
import './markdown-styles.css';

const { Title, Text } = Typography;

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

  const stats = useMemo(() => {
    const categories = Object.keys(notes);
    // 计算分类总数 (排除 'home' 这种非真实分类，如果你 notes 里不含 home 就不需要 filter)
    const categoryCount = categories.length;
    
    // 计算文章总数：把所有分类下的数组扁平化，然后取长度
    const articleCount = Object.values(notes).flat().length;

    return { categoryCount, articleCount };
  }, [notes]);

  // 2. Generate TOC
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

  const MainContentSection = (
    <div style={{
      flex: 1,
      height: 0,
      width: '100%',
      backgroundImage: currentKey === 'home' ? 'none' : `url(/img/background_${randomBgId}.jpg)`, 
      backgroundColor: currentKey === 'home' ? '#f0f2f5' : 'transparent', // Home 页底色
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
    }}>
      {currentKey !== 'home' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)' }} />}

      {currentKey === 'home' ? (
        <HomePage 
          categories={menuItems.filter(item => item?.key !== 'home') as any[]} 
          onNavigate={(key) => setCurrentKey(key)}
          avatarSrc="/img/avatar.jpg"
          githubProfile="https://github.com/KuHuSu" 
          projectRepo="https://github.com/KuHuSu/mynotes_source" 
          articleCount={stats.articleCount}
          categoryCount={stats.categoryCount}
        />
      ) :(<div style={{ position: 'relative', zIndex: 1, height: '100%', padding: '20px 0' }}>
          <Row style={{ height: '100%', width: '100%', margin: 0 }}>
            <Col span={1} />
            <Col span={22} style={{ height: '100%' }}>
              <Row gutter={20} style={{ height: '100%' }}>

                {/* Left Sidebar */}
                <Col span={4} xl={4} lg={5} md={0} style={{ height: '100%', paddingLeft: 24 }}>
                  <FileSidebar
                    fileList={notes[currentKey]}
                    onFileClick={handleFileClick}
                    currentFile={currentNote}
                  />
                </Col>

                {/* Center Content Area */}
                <Col span={16} style={{ height: '100%', padding: '0 24px' }}>
                  <NoteViewer 
                    content={mdContent} 
                    loading={loading} 
                    currentNote={currentNote} // 传入当前笔记的元数据（作者、日期等）
                    scrollRef={scrollContainerRef} // 传入 ref 用于滚动同步
                  />
                </Col>                

                {/* Right Sidebar: TOC */}
                <Col span={4} xl={4} lg={0} md={0} style={{ height: '100%', paddingRight: 24 }}>
                  <TocSidebar 
                    items={tocItems} 
                    containerRef={scrollContainerRef} 
                    hasContent={currentKey !== 'home' && !!mdContent} // 只有不在首页且有内容时才显示
                  />
                </Col>
              </Row>
            </Col>
            <Col span={1} />
          </Row>
        </div>
      )}
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Menu: { fontSize: 16, itemColor: 'rgba(0,0,0,0.7)', itemSelectedColor: '#1890ff', activeBarHeight: 3 },
          Anchor: { linkPaddingBlock: 6, linkPaddingInlineStart: 10 } // 优化 Anchor 间距
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
        <SiteHeader 
          currentKey={currentKey}
          menuItems={menuItems}
          onMenuClick={setCurrentKey}
        />
        {MainContentSection}
      </div>
    </ConfigProvider>
  );
}