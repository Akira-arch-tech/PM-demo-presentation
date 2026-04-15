# FUNDAMENTAL M2：本地后端 API 联调说明

## 1) 本次新增了什么

- 新增本地 API 服务：`server/index.js`
- 新增商品数据源：`server/data/products.js`
- 前端改为请求 API，不再只靠本地写死数组
- 新增联调命令：`npm run dev:full`（前后端同时启动）

## 2) API 清单

- `GET /api/health`：健康检查
- `GET /api/categories`：分类列表
- `GET /api/products?category=亚克力`：商品列表（支持分类过滤）
- `POST /api/quote`：实时报价
- `POST /api/orders`：创建订单（模拟）

## 3) 数据流（Demo）

1. 页面加载 -> 取分类、取商品
2. 用户改商品/尺寸/数量 -> 调报价接口刷新金额
3. 用户点下单 -> 调订单接口返回订单号与预计发货

## 4) 运行方式

```bash
npm install
npm run dev:full
```

- 前端：`http://localhost:5173`
- 后端：`http://localhost:8787`

## 5) 下一步（M3）

- 把“上传图片”从状态显示升级为真正的文件上传接口
- 增加预览图生成（Image Processing）与对象存储（Object Storage）
