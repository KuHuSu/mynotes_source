const fs = require('fs');
const path = require('path');

// 1. 基础配置
const notesDir = path.join(__dirname, '../public/notes');
const outputFile = path.join(__dirname, '../public/notes-list.json');

// 定义结果对象
const result = {};

// 2. 开始扫描
if (fs.existsSync(notesDir)) {
    const categories = fs.readdirSync(notesDir);

    categories.forEach(dirname => {
        const dirPath = path.join(notesDir, dirname);
        
        // 确保是目录
        if (fs.statSync(dirPath).isDirectory()) {
            
            result[dirname] = [];
            
            // 读取目录内的 .md 文件
            const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));

            files.forEach(file => {
                // 去掉后缀，拿到类似 [test10]-[2026-12-20]-[KuHuSu] 的字符串
                const rawName = file.replace('.md', '');

                // --- 核心修改：使用正则解析 ---
                // 正则解释：
                // ^\[      : 以 [ 开头
                // (.+?)    : 第1组(filename)，非贪婪匹配任意字符
                // \]       : 遇到 ] 结束
                // -        : 中间有个横杠（忽略）
                // \[       : 下一个 [ 开始
                // (.+?)    : 第2组(date)
                // \]       : 遇到 ] 结束
                // -        : 中间有个横杠（忽略）
                // \[       : 最后一个 [ 开始
                // (.+?)    : 第3组(author)
                // \]       : 遇到 ] 结束
                const regex = /^\[(.+?)\]-\[(.+?)\]-\[(.+?)\]$/;
                const match = rawName.match(regex);

                let titleStr, dateStr, authorStr;

                if (match) {
                    // match[1] 是第一个括号里的内容 (filename)
                    // match[2] 是第二个括号里的内容 (date)
                    // match[3] 是第三个括号里的内容 (author)
                    titleStr = match[1];
                    dateStr = match[2];
                    authorStr = match[3];
                } else {
                    // 如果文件名不符合 [A]-[B]-[C] 格式的兜底处理
                    console.warn(`⚠️ 文件格式不匹配: ${file}`);
                    titleStr = rawName;
                    dateStr = '';
                    authorStr = '';
                }

                // 生成相对路径
                // 如果是在 Windows 运行但给前端用，最好强制转为 /
                const relativePath = `/notes/${dirname}/${file}`;

                result[dirname].push({
                    filename: titleStr, 
                    date: dateStr,
                    author: authorStr,
                    path: relativePath
                });
            });
        }
    });
} else {
    console.error(`❌ 目录不存在: ${notesDir}`);
}

// 写入 JSON
fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));

// 统计总数
const totalDirs = Object.keys(result).length;
const totalFiles = Object.values(result).flat().length;

console.log(`✅ 扫描完成！`);
console.log(`📂 包含目录: ${totalDirs} 个`);
console.log(`📝 文章总数: ${totalFiles} 篇`);
console.log(`💾 索引已保存至: ${outputFile}`);