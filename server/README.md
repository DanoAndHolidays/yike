# 一刻短剧后端
这里是yike的后端代码，我也终于是要向着全栈方向前进了。

因为我是先创建的前端项目，前期从未想过要加入后端，要移动前端项目进入新的文件夹可能会有路径问题。由于一刻是单人开发小项目，最小改动也是一个不错的选择。


推荐的结构：
```txt
G:\Save\Grogramming\Vue3\yike\
├── frontend/           # 将现有前端项目移到这里
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...（现有所有前端文件）
├── backend/           # 新建后端目录
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── app.js
│   ├── package.json
│   └── ...（后端文件）
├── shared/            # 共享代码（可选）
└── README.md
```

## 视频处理
秒传、合并切片与接受上传的切片。