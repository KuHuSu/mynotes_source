const fs = require('fs');
const path = require('path');

// 1. 基础配置
const notesDir = path.join(__dirname, '../public/notes');
const outputFile = path.join(__dirname, '../public/notes-list.json');

// 定义结果对象
const result = {};

// 2. 开始扫描
if (fs.existsSync(notesDir)) {
    // 读取所有目录名
    let categories = fs.readdirSync(notesDir);

    // ==========================================
    // 🔥 新增逻辑 1：将 '其他' 移动到数组末尾
    // ==========================================
    const targetDir = '其他';
    if (categories.includes(targetDir)) {
        const otherDirs = categories.filter(c => c !== targetDir);
        categories = [...otherDirs, targetDir];
    }
    // ==========================================

    categories.forEach(dirname => {
        const dirPath = path.join(notesDir, dirname);
        
        try {
            if (fs.statSync(dirPath).isDirectory()) {
                
                result[dirname] = [];
                
                // 读取目录内的 .md 文件
                const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));

                files.forEach(file => {
                    // 去掉后缀，拿到类似 [test10]-[2026-12-20]-[KuHuSu] 的字符串
                    const rawName = file.replace('.md', '');
                    const regex = /^\[(.+?)\]-\[(.+?)\]-\[(.+?)\]$/;
                    const match = rawName.match(regex);

                    let titleStr, dateStr, authorStr;

                    if (match) {
                        // match[1] 是第一个括号里的内容 (filename)
                        titleStr = match[1];
                        dateStr = match[2];
                        authorStr = match[3];
                    } else {
                        // 兜底处理
                        console.warn(`⚠️ 文件格式不匹配: ${file}`);
                        titleStr = rawName;
                        dateStr = '';
                        authorStr = '';
                    }

                    const relativePath = `/notes/${dirname}/${file}`;

                    result[dirname].push({
                        filename: titleStr, 
                        date: dateStr,
                        author: authorStr,
                        path: relativePath
                    });
                });

                // ==========================================
                // 🔥 新增逻辑 2：将 filename 为 '介绍' 的置顶
                // ==========================================
                const currentList = result[dirname];
                // 查找名字叫做 "介绍" 的笔记索引
                const introIndex = currentList.findIndex(item => item.filename === '介绍');

                // 如果找到了，并且它不在第一个位置
                if (introIndex > 0) {
                    // 1. 把它从数组中切出来 (splice 返回被删除元素的数组)
                    const [introItem] = currentList.splice(introIndex, 1);
                    // 2. 把它插到数组最前面
                    currentList.unshift(introItem);
                }
                // ==========================================
            }
        } catch (err) {
            console.error(`跳过无法读取的路径: ${dirPath}`, err);
        }
    });

    // 3. 写入文件
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    console.log(`✅ 笔记列表已生成: ${outputFile}`);

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