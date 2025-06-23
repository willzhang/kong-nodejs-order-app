# 后端B - 订单服务 Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 创建package.json
RUN echo '{ \
  "name": "order-service", \
  "version": "1.0.0", \
  "description": "电商订单服务", \
  "main": "app.js", \
  "scripts": { \
    "start": "node app.js", \
    "dev": "nodemon app.js" \
  }, \
  "dependencies": { \
    "express": "^4.18.2", \
    "axios": "^1.6.0", \
    "cors": "^2.8.5" \
  }, \
  "keywords": ["order", "service", "ecommerce"], \
  "author": "System", \
  "license": "MIT" \
}' > package.json

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY app.js .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 更改文件所有权
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { \
    process.exit(res.statusCode === 200 ? 0 : 1); \
  }).on('error', () => process.exit(1));"

# 启动应用
CMD ["npm", "start"]
