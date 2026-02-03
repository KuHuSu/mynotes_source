// import yayJpg from '../assets/yay.jpg';

// export default function HomePage() {
//   return (
//     <div>
//       <h2>Yay! Welcome to umi!</h2>
//       <p>
//         <img src={yayJpg} width="388" />
//       </p>
//       <p>
//         To get started, edit <code>pages/index.tsx</code> and save to reload.
//       </p>
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import { Card, List, Typography } from 'antd';
import ReactMarkdown from 'react-markdown'; // 需要 pnpm add react-markdown

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [content, setContent] = useState('');

  // 1. 初始化时，请求 notes-list.json
  useEffect(() => {
    fetch('/notes-list.json') // 因为在 public 下，所以直接根路径访问
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error("无法加载文章列表", err));
  }, []);

  // 2. 点击文章时，请求对应的 .md 文件
  const handleRead = (filename) => {
    fetch(`/notes/${filename}`)
      .then(res => res.text())
      .then(text => {
        setContent(text);
        setSelectedNote(filename);
      });
  };

  return (
    <div style={{ padding: 20 }}>
      {selectedNote ? (
        // 显示文章详情
        <div>
          <button onClick={() => setSelectedNote(null)}>返回列表</button>
          <div style={{ marginTop: 20 }}>
             <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      ) : (
        // 显示文章列表
        <List
          header={<div>我的学习笔记</div>}
          bordered
          dataSource={notes}
          renderItem={(item: any) => (
            <List.Item onClick={() => handleRead(item.filename)} style={{cursor: 'pointer'}}>
              <List.Item.Meta
                title={item.title}
                description={`更新时间: ${item.updated}`}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
