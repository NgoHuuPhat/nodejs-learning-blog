# Sử dụng Node.js phiên bản LTS
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose port
EXPOSE 3000

# Khởi chạy ứng dụng
CMD ["npm", "start"]
