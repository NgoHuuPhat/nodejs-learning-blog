# 📝 Blog Platform

A modern full-stack blog application built with Node.js, Express, MongoDB, and Handlebars.

## ✨ Features

- 🔐 **Authentication** - JWT & Google OAuth 2.0
- ✍️ **Rich Editor** - TinyMCE for content creation
- 🖼️ **Media Upload** - Cloudinary integration
- 👥 **Admin Panel** - User & content management
- 💳 **Payment** - VNPay integration
- 📱 **Responsive** - Mobile-friendly design

## 🚀 Tech Stack

**Backend:** Node.js • Express • MongoDB • Mongoose • JWT  
**Frontend:** Handlebars • SCSS • TinyMCE  
**Cloud:** Cloudinary • Vercel • VNPay

## 🛠️ Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/NgoHuuPhat/NodeJS_Blog.git
   cd NodeJS_Blog
   npm install
   ```

2. **Environment Setup**
   ```env
   MONGODB_URI=mongodb://localhost:27017/blog
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=3000
   ```

3. **Run Development**
   ```bash
   npm start          # Start server
   npm run watch      # Watch SCSS
   npm run beautiful  # Format code
   ```

## 📂 Project Structure

```
src/
├── app/
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Custom middleware
│   └── models/         # Database models
├── routes/
│   ├── admin/          # Admin routes
│   └── client/         # Public routes
├── config/             # Database & auth config
├── public/             # Static assets
└── resources/          # Views & SCSS
```

## 🚀 Deployment

**Vercel (Recommended)**
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Ngo Huu Phat**  
🐙 [GitHub](https://github.com/NgoHuuPhat) • 📧 [Email](mailto:ngoohuuphat@gmail.com)

---

⭐ **Star this repo if you find it helpful!**