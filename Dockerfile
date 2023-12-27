FROM node:16.14.2-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用程序代码到工作目录
COPY . .

# 暴露应用程序的端口
EXPOSE 80

# 运行 Koa 应用程序
CMD ["node", "./src/main.js"]