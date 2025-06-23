# 前端A - 订单管理页面 Dockerfile
FROM nginx:alpine

# 复制HTML文件到nginx默认目录
COPY index.html /usr/share/nginx/html/

# 创建nginx配置文件
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ =404; \
    } \
    \
    # 启用gzip压缩 \
    gzip on; \
    gzip_types text/html text/css application/javascript; \
    \
    # 安全头 \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
}' > /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
