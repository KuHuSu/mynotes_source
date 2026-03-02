import { useState, useMemo, useEffect, useRef } from 'react';
import { ConfigProvider, Row, Col, Button, Tooltip } from 'antd';
import { 
  HomeOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  PicRightOutlined, 
  PicCenterOutlined 
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import FileSidebar, { TocSidebar, NoteViewer, SiteHeader } from './Compoent'; 
import { HomePage } from './HomePage';
import './markdown-styles.css';
import 'katex/dist/katex.min.css';

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
  const [leftExpanded, setLeftExpanded] = useState(true);
  const [rightExpanded, setRightExpanded] = useState(true);

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
    const categoryCount = categories.length;
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

  const leftSpan = leftExpanded ? 4 : 0;
  const rightSpan = rightExpanded ? 4 : 0;
  const centerSpan = 24 - leftSpan - rightSpan;

  const MainContentSection = (
    <div style={{
      flex: 1,
      // height: 0,
      width: '100%',
      backgroundImage: currentKey === 'home' ? 'none' : `url(/img/background_${randomBgId}.jpg)`, 
      backgroundColor: currentKey === 'home' ? '#f0f2f5' : 'transparent', // Home 页底色
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
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
      ) :(
        <div style={{ position: 'relative', zIndex: 1, padding: '20px 0', minHeight: '100vh' }}>
          
          {/* 悬浮的折叠控制按钮 */}
          <div style={{ position: 'fixed', bottom: 40, left: 40, zIndex: 10 }}>
            <Tooltip title={leftExpanded ? "收起左侧列表" : "展开左侧列表"}>
              <Button 
                shape="circle" 
                icon={leftExpanded ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />} 
                onClick={() => setLeftExpanded(!leftExpanded)} 
              />
            </Tooltip>
          </div>
          <div style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 10 }}>
            <Tooltip title={rightExpanded ? "收起右侧目录" : "展开右侧目录"}>
              <Button 
                shape="circle" 
                icon={rightExpanded ? <PicCenterOutlined /> : <PicRightOutlined />} 
                onClick={() => setRightExpanded(!rightExpanded)} 
              />
            </Tooltip>
          </div>

          <Row style={{ width: '100%', margin: 0 }}>
            <Col span={1} />
            <Col span={22}>
              <Row gutter={20}>

                {/* Left Sidebar */}
                <Col 
                  span={leftSpan} 
                  xl={leftSpan} lg={leftExpanded ? 5 : 0} md={0} 
                  style={{ 
                    display: leftExpanded ? 'block' : 'none',
                    paddingLeft: 24,
                    // 粘性定位，随页面滚动但停留在距离顶部 20px 的位置
                    position: 'sticky',
                    top: 20,
                    height: 'calc(100vh - 40px)', // 防止侧边栏自身太长超出屏幕
                  }}
                  className="hide-scrollbar" // 隐藏内部滚动条的类名
                >
                  <FileSidebar
                    fileList={notes[currentKey]}
                    onFileClick={handleFileClick}
                    currentFile={currentNote}
                  />
                </Col>

                {/* Center Content Area */}
                <Col span={centerSpan} style={{ padding: '0 24px', transition: 'all 0.3s ease' }}>
                  <NoteViewer 
                    content={mdContent} 
                    loading={loading} 
                    currentNote={currentNote}
                    scrollRef={scrollContainerRef}
                  />
                </Col>                

                {/* Right Sidebar: TOC */}
                <Col 
                  span={rightSpan} 
                  xl={rightSpan} lg={0} md={0} 
                  style={{ 
                    display: rightExpanded ? 'block' : 'none',
                    paddingRight: 24,
                    position: 'sticky',
                    top: 20,
                    height: 'calc(100vh - 40px)', 
                  }}
                  className="hide-scrollbar"
                >
                  <TocSidebar 
                    items={tocItems} 
                    containerRef={scrollContainerRef} 
                    hasContent={currentKey !== 'home' && !!mdContent} 
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
        minHeight: '100vh',
        // overflow: 'hidden',
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