# 🎓 Institute MCQ Test System

Complete Online MCQ Test System for Educational Institutes with Student Portal, Teacher Dashboard, and Multi-language Support.

## ✨ Features

### Student Portal
- ✅ Simple login with ID and name
- ✅ Course, timing, and month selection
- ✅ 30-minute timed tests
- ✅ 10-20 MCQ questions per test
- ✅ Full-screen mode enforcement
- ✅ Copy/paste prevention
- ✅ Tab-switch detection with auto-submit
- ✅ Multi-language support (English/Urdu)
- ✅ Instant results after submission

### Teacher Dashboard
- ✅ Secure login with username/password
- ✅ Add/Edit/Delete questions
- ✅ Create courses and timings
- ✅ Create tests with month assignment
- ✅ Set unlock dates (e.g., 1st-5th of month)
- ✅ View student results
- ✅ Export results to Excel/CSV
- ✅ Filter results by month

### Data Security
- ✅ Organization-level data separation
- ✅ Teacher-level data isolation
- ✅ Each teacher only sees their own data
- ✅ Students only access unlocked tests

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Download/Clone the repository**
```bash
git clone https://github.com/FarisDataAnalysts/institute-mcq-test-system.git
cd institute-mcq-test-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

4. **Open in browser**
```
http://localhost:3000
```

### Demo Login
```
Username: teacher1
Password: teacher123
```

## 📁 Project Structure

```
institute-mcq-test-system/
├── server.js              # Main server file
├── package.json           # Dependencies
├── database.db            # SQLite database (auto-created)
├── public/
│   ├── index.html        # Home page
│   ├── test.html         # Student test page
│   ├── teacher.html      # Teacher dashboard
│   ├── style.css         # Main stylesheet
│   ├── script.js         # Main JavaScript
│   ├── test-script.js    # Test page JavaScript
│   └── teacher-script.js # Teacher dashboard JavaScript
└── README.md             # This file
```

## 🔧 Configuration

### Change Port
Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your port
```

### Change JWT Secret
Edit `server.js`:
```javascript
const JWT_SECRET = 'your-super-secret-key-here';
```

### Change Test Duration
Default is 30 minutes. To change, edit in teacher dashboard when creating test.

## 🌐 Deployment

### Deploy to Railway.app (Recommended)
1. Create account on [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select this repository
4. Railway will auto-detect and deploy

### Deploy to Render.com
1. Create account on [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Build Command: `npm install`
5. Start Command: `npm start`

### Deploy to VPS (DigitalOcean, Linode, etc.)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/FarisDataAnalysts/institute-mcq-test-system.git
cd institute-mcq-test-system

# Install dependencies
npm install

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start server.js --name mcq-system

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

### Setup with Domain
1. Point your domain to server IP
2. Install Nginx:
```bash
sudo apt install nginx
```

3. Create Nginx config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Install SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 📊 Database

The system uses SQLite by default (file-based, no setup needed).

### Migrate to MySQL/PostgreSQL (Production)

1. Install database driver:
```bash
npm install mysql2
# or
npm install pg
```

2. Update `server.js` database connection

### Database Schema
- **organizations**: Institute data
- **teachers**: Teacher accounts
- **courses**: Courses created by teachers
- **timings**: Class timings
- **tests**: Tests with unlock dates
- **questions**: MCQ questions
- **student_attempts**: Student test submissions

## 🔐 Multi-Organization Setup

To sell to multiple organizations:

### Option 1: Subdomain
- `institute-a.yourdomain.com`
- `institute-b.yourdomain.com`

### Option 2: Organization Code
- `yourdomain.com/org/institute-a`
- `yourdomain.com/org/institute-b`

Each organization's data is automatically isolated in the database.

## 🛠️ Customization

### Add More Months
Currently supports 4 months. To add more, edit the month dropdown in `index.html` and `teacher.html`.

### Change Question Limits
Edit validation in `teacher-script.js` to change min/max questions per test.

### Add Translation Languages
Add more language options in `changeLanguage()` function in `script.js`.

### Integrate Google Translate API
For real-time translation, integrate Google Translate API in the test page.

## 📝 Usage Guide

### For Teachers

1. **Login** with username and password
2. **Add Courses**: Mathematics, Physics, etc.
3. **Add Timings**: Morning, Evening, etc.
4. **Create Test**:
   - Select course and timing
   - Choose month (1-4)
   - Set unlock dates
5. **Add Questions**:
   - Select test
   - Add 10-20 MCQ questions
   - Set correct answer
6. **View Results**:
   - Filter by month
   - Export to Excel

### For Students

1. **Enter** Student ID and Name
2. **Select** Course, Timing, and Month
3. **Start Test** (if unlocked)
4. **Answer** all questions
5. **Submit** to see results

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
sudo lsof -t -i tcp:3000 | xargs kill -9
```

### Database locked
```bash
# Remove database file and restart
rm database.db
npm start
```

### Cannot find module
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 🤝 Support

For issues or questions:
- Create an issue on GitHub
- Email: support@yourdomain.com

## 🎯 Roadmap

- [ ] Add image support in questions
- [ ] Add video explanations
- [ ] Add practice mode
- [ ] Add leaderboard
- [ ] Add email notifications
- [ ] Add mobile app
- [ ] Add analytics dashboard

## 👨‍💻 Developer

Created with ❤️ for educational institutes

---

**Note**: This is a production-ready system. You can deploy it to any hosting service and start using immediately!