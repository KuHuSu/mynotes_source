import React from 'react';
import { 
  Button, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Card,
  Space
} from 'antd';
import { 
  GithubOutlined, 
  CodeOutlined, 
  DesktopOutlined, 
  GlobalOutlined, 
  ApiOutlined, 
  PartitionOutlined, 
  LineChartOutlined,
  ReadOutlined,
  RightOutlined,
  RocketOutlined,
  BookOutlined,
  CalendarOutlined, 
  FileTextOutlined, 
  AppstoreOutlined,
  EnvironmentOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

// --- 类型定义 ---
interface HomePageProps {
  categories: { key: string; label: string }[];
  onNavigate: (key: string) => void;
  avatarSrc: string;
  githubProfile: string;
  projectRepo: string;
  articleCount: number;
  categoryCount: number;
}

// --- 静态配置 ---
const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
  "C++": { 
    icon: <CodeOutlined />, 
    color: '#f50057', 
    desc: '主要研究如何手动制造段错误。' 
  },
  "操作系统": { 
    icon: <DesktopOutlined />, 
    color: '#2979ff', 
    desc: '打不过寅虎是因为系统卡住了。' 
  },
  "网络技术": { 
    icon: <GlobalOutlined />, 
    color: '#00e676', 
    desc: '先握手三次，再开始聊天。' 
  },
  "51汇编": { 
    icon: <ApiOutlined />, 
    color: '#ff9100', 
    desc: '你告诉我生物医学工程专业考研考这个？？' 
  },
  "数据结构": { 
    icon: <PartitionOutlined />, 
    color: '#651fff', 
    desc: '链表断了，二叉树歪了，头发也秃了。' 
  },
  "算法": { 
    icon: <LineChartOutlined />, 
    color: '#00b0ff', 
    desc: '致力于把 O(n²) 优化成 O(log n)。' 
  },
  default: { 
    icon: <BookOutlined />, 
    color: '#607d8b', 
    desc: '杂七杂八、暂不分类。' 
  }
};

export const HomePage: React.FC<HomePageProps> = ({ 
  categories, 
  onNavigate, 
  avatarSrc, 
  githubProfile, 
  projectRepo,
  articleCount, 
  categoryCount 
}) => {

    const START_DATE = '2026-02-01';   
    const daysRunning = React.useMemo(() => {
        const start = new Date(START_DATE).getTime();
        const now = new Date().getTime();
        const diff = now - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }, []);
  
    return (
        <div style={{ 
          height: '100%', 
          overflowY: 'auto', 
          // 增加一点内边距，让布局更舒服
          padding: '60px 40px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
        }} className="custom-scrollbar">
          
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            
            {/* 核心布局：左右两栏 */}
            <Row gutter={[48, 48]} align="middle" style={{ minHeight: '60vh' }}>
              
              {/* === Left Column: Profile & Intro (占据 35% ~ 40%) === */}
              <Col xs={24} md={24} lg={9} xl={8}>
                <div style={{ 
                  textAlign: 'left', // 左对齐更适合侧边栏
                  animation: 'fadeInLeft 0.8s ease',
                  padding: '20px'
                }}>
                  {/* 头像 */}
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
                    <Avatar 
                        size={160} 
                        src={avatarSrc} 
                        style={{ 
                          border: '4px solid white', 
                          boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                        }} 
                    />
                    {/* 可以在头像旁加一个小装饰，比如在线状态点 */}
                    <div style={{
                      position: 'absolute', bottom: 10, right: 10,
                      width: 24, height: 24, background: '#52c41a',
                      borderRadius: '50%', border: '3px solid #fff'
                    }} />
                  </div>

                  <Title level={1} style={{ margin: '0 0 16px 0', color: '#2c3e50', fontWeight: 800 }}>
                      个人笔记
                  </Title>
                  
                  {/* 座右铭 / 介绍 */}
                  <div style={{ marginBottom: 32 }}>
                    <Text 
                        type="secondary" 
                        style={{ 
                            fontSize: 18, 
                            lineHeight: 1.8,
                            display: 'block',
                            color: '#555',
                            marginBottom: 16
                        }}
                    >
                        KuHuSu 试图在 <span style={{ color: '#ff4d4f', fontWeight: 600 }}>内存泄漏</span> 里游泳。
                    </Text>
                    
                    <Space size="middle" style={{ color: '#888' }}>
                       <span><EnvironmentOutlined /> Internet</span>
                       <span><ReadOutlined /> Learning</span>
                    </Space>
                  </div>
                  
                  {/* 按钮组：改为纵向排列或更紧凑的横向 */}
                  <Space size="middle" wrap>
                      <Button type="primary" shape="round" icon={<GithubOutlined />} size="large" href={githubProfile} target="_blank">
                        My Github
                      </Button>
                      <Button shape="round" icon={<RocketOutlined />} size="large" href={projectRepo} target="_blank">
                        Source Code
                      </Button>
                  </Space>
                </div>
              </Col>

              {/* === Right Column: Category Grid (占据 60% ~ 65%) === */}
              <Col xs={24} md={24} lg={15} xl={16}>
                 <div style={{ animation: 'fadeInRight 0.8s ease' }}>
                    {/* 分类卡片列表 */}
                    <Row gutter={[20, 20]}>
                    {categories.filter(c => c.key !== 'home').map((cat) => {
                        const meta = CATEGORY_META[cat.key] || CATEGORY_META.default;
                        return (
                        <Col xs={24} sm={12} md={12} lg={12} xl={8} key={cat.key}>
                            <Card
                              hoverable
                              onClick={() => onNavigate(cat.key)}
                              style={{ 
                                  borderRadius: 16, 
                                  border: 'none',
                                  height: '100%',
                                  background: 'rgba(255,255,255,0.6)', // 更通透一点
                                  backdropFilter: 'blur(12px)',
                                  transition: 'transform 0.3s, box-shadow 0.3s',
                                  overflow: 'hidden'
                              }}
                              bodyStyle={{ padding: '24px 20px' }}
                              // 添加 hover 效果
                              className="category-card" 
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                                  <div style={{ 
                                    width: 44, height: 44, borderRadius: 10, 
                                    background: `${meta.color}15`, 
                                    color: meta.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 22, marginRight: 12, flexShrink: 0
                                  }}>
                                    {meta.icon}
                                  </div>
                                  <div>
                                     <Title level={5} style={{ margin: '0 0 4px 0', fontSize: 16 }}>{cat.label}</Title>
                                     <div style={{ 
                                       color: '#888', 
                                       fontSize: 13, 
                                       lineHeight: 1.5,
                                       // 限制只显示两行
                                       display: '-webkit-box',
                                       WebkitLineClamp: 2,
                                       WebkitBoxOrient: 'vertical',
                                       overflow: 'hidden'
                                     }}>
                                         {meta.desc}
                                     </div>
                                  </div>
                              </div>
                              <div style={{ textAlign: 'right', color: '#1890ff', fontSize: 12, fontWeight: 600 }}>
                                开始阅读 <RightOutlined style={{ fontSize: 10 }} />
                            </div>
                            </Card>
                        </Col>
                        );
                    })}
                    </Row>
                 </div>
              </Col>
            </Row>

            {/* === Bottom Section: Stats === */}
            {/* 使用 margin-top 将其推到下方，保持居中 */}
            <div style={{ marginTop: 80, padding: '0 20px', animation: 'fadeInUp 1s ease' }}>
                <Row gutter={24} justify="center"> 
                    {/* 统计 1 */}
                    <Col xs={24} sm={8} md={6}>
                       <StatCard 
                         title="累计收录" 
                         value={articleCount} 
                         suffix="篇" 
                         icon={<FileTextOutlined style={{ color: '#1890ff', fontSize: 24 }} />} 
                       />
                    </Col>
                    
                    {/* 统计 2 */}
                    <Col xs={24} sm={8} md={6}>
                       <StatCard 
                         title="平稳运行" 
                         value={daysRunning} 
                         suffix="天" 
                         icon={<CalendarOutlined style={{ color: '#52c41a', fontSize: 24 }} />} 
                       />
                    </Col>

                    {/* 统计 3 */}
                    <Col xs={24} sm={8} md={6}>
                       <StatCard 
                         title="涵盖领域" 
                         value={categoryCount} 
                         suffix="个" 
                         icon={<AppstoreOutlined style={{ color: '#faad14', fontSize: 24 }} />} 
                       />
                    </Col>
                </Row>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: 60, color: '#aaa', fontSize: 13 }}>
               <ReadOutlined spin style={{ marginRight: 8 }} />
               Designed by KuHuSu · Powered by React & Ant Design
            </div>
          </div>
        </div>
    );
};

// --- 提取出来的小组件：统计卡片 ---
const StatCard = ({ title, value, suffix, icon }: any) => (
  <Card bordered={false} style={{ 
      background: 'rgba(255,255,255,0.5)', 
      backdropFilter: 'blur(4px)',
      borderRadius: 12,
      textAlign: 'center',
      marginBottom: 16,
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
  }}>
      <div style={{ marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: '#333' }}>
         {value} <span style={{ fontSize: 14, fontWeight: 400, color: '#999' }}>{suffix}</span>
      </div>
  </Card>
);