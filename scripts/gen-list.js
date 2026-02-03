// scripts/gen-list.js
const fs = require('fs');
const path = require('path');

// 文章目录
const notesDir = path.join(__dirname, '../public/notes');
// 输出的列表文件
const outputFile = path.join(__dirname, '../public/notes-list.json');

// 读取目录
const files = fs.readdirSync(notesDir).filter(file => file.endsWith('.md'));

// 生成列表数据
const list = files.map(file => {
  const stat = fs.statSync(path.join(notesDir, file));
  return {
    filename: file,
    title: file.replace('.md', ''), // 简单用文件名作标题
    updated: stat.mtime.toLocaleDateString()
  };
});

// 写入 json
fs.writeFileSync(outputFile, JSON.stringify(list, null, 2));

console.log(`✅ 成功扫描 ${list.length} 篇 Markdown 文章，已生成索引！`);