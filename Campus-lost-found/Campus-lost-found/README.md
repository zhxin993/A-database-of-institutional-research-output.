# 校园失物招领系统

一个基于 Vue 3 + Vite 的校园失物招领平台，支持智能匹配功能。

## 功能特性

- 用户注册和登录
- 发布失物和招领信息
- 智能匹配功能
- 站内消息系统
- 物品状态管理
- 图片上传

## 智能匹配功能

### 后端接口

智能匹配功能使用以下后端接口：

1. **触发智能匹配**: `POST /api/match_item`
   - 当用户发布新物品时，系统会自动调用此接口进行智能匹配
   - 请求体: `{"title": "物品标题", "type": "物品类型"}`
   - 需要用户认证（Bearer Token）

2. **获取匹配通知**: `GET /api/notifications`
   - 获取当前用户的所有匹配通知
   - 需要用户认证（Bearer Token）

### 前端实现

#### 1. 发布物品时自动触发匹配

在 `src/views/PublishView.vue` 中，当用户成功发布物品后，系统会自动调用智能匹配：

```javascript
// 发布成功后触发智能匹配
if (!isEditing.value) {
  try {
    const newItemId = res.data.id || res.data.item_id;
    if (newItemId) {
      const matches = await itemStore.findMatches(newItemId);
      if (matches && matches.length > 0) {
        alert(`发布成功！找到 ${matches.length} 个匹配项`);
      } else {
        alert("发布成功！暂无匹配项");
      }
    }
  } catch (err) {
    console.error("智能匹配失败:", err);
  }
}
```

**注意**: `findMatches` 方法会先获取物品详情，然后调用智能匹配接口。

#### 2. 匹配通知显示

匹配通知会在以下页面显示：
- 首页 (`src/views/HomeView.vue`)
- 消息页面 (`src/views/MessagesView.vue`)

#### 3. 测试功能

在首页登录后，如果用户有发布的物品，会显示"测试智能匹配"按钮，可以手动测试匹配功能。

### 数据结构

匹配通知的数据结构应该包含：

```javascript
{
  id: "通知ID",
  type: "lost" | "found", // 通知类型
  lostItem: {
    id: "失物ID",
    title: "失物标题",
    // 其他失物信息
  },
  foundItem: {
    id: "拾获物品ID", 
    title: "拾获物品标题",
    // 其他拾获物品信息
  }
}
```

## 开发环境

### 前端

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 后端

确保后端服务器运行在 `http://localhost:5000`，并实现以下接口：

- `POST /api/post_item` - 发布物品
- `POST /api/match_item` - 智能匹配
- `GET /api/notifications` - 获取匹配通知
- `GET /api/my-items` - 获取用户物品
- `GET /api/items/search` - 搜索物品
- `GET /api/items/{id}` - 获取物品详情
- `PUT /api/items/{id}` - 更新物品
- `DELETE /api/items/{id}` - 删除物品

## 代理配置

前端通过 Vite 代理将 `/api` 请求转发到后端：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5000',
      changeOrigin: true,
    }
  }
}
```

## 注意事项

1. 确保后端实现了正确的智能匹配算法
2. 匹配通知需要用户认证
3. 前端会自动处理认证失败的情况（401错误）
4. 智能匹配失败不会影响物品发布流程

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
