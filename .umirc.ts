import { defineConfig } from "umi";

export default defineConfig({

  title: 'KHS`s Notes | 学习记录',
  
  routes: [
    { path: "/", component: "index" },
    { 
      path: '*', 
      redirect: 'https://kuhusu.github.io/' 
    }
  ],
  plugins: [
    '@umijs/plugins/dist/antd'
  ],

  // 2. 开启 antd 配置
  antd: {},
  npmClient: 'pnpm',
  history: { type: 'hash' },
  base: '/',
  publicPath: '/',
  outputPath: 'dist',
});
