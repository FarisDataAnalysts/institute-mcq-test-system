# 🎓 Institute MCQ Test System

A complete web-based Multiple Choice Question (MCQ) test management system for educational institutes. Teachers can create tests, manage questions, and view results. Students can take timed tests with anti-cheat features.

**بالکل آسان MCQ ٹیسٹ سسٹم - اساتذہ اور طلباء کے لیے**

---

## ✨ Features

### 👨‍🏫 **Teacher Dashboard**
- ✅ **Easy Registration** - No PowerShell or technical knowledge needed
- ✅ **Course Management** - Add/Delete courses
- ✅ **Timing Management** - Add/Delete class timings
- ✅ **Test Creation** - Create tests with unlock dates
- ✅ **Question Bank** - Add/Delete unlimited questions
- ✅ **Results Dashboard** - View student performance
- ✅ **Excel Export** - Download results as CSV
- ✅ **Multi-Teacher Support** - Complete data isolation
- ✅ **Month-wise Organization** - Filter by month

### 👨‍🎓 **Student Portal**
- ✅ **Simple Login** - Student ID + Name
- ✅ **Course Selection** - Choose course, timing, month
- ✅ **Timed Tests** - 30-minute countdown timer
- ✅ **Full-Screen Mode** - Minimize distractions
- ✅ **Anti-Cheat** - Tab switch detection
- ✅ **Progress Tracking** - See answered questions
- ✅ **Instant Results** - Score and percentage
- ✅ **Mobile Friendly** - Works on phones/tablets

---

## 🚀 Quick Start (3 Steps!)

### **Step 1: Download**
```bash
# Download ZIP
https://github.com/FarisDataAnalysts/institute-mcq-test-system/archive/refs/heads/main.zip

# Extract to folder
```

### **Step 2: Install Node.js (One-time)**
- Download: https://nodejs.org
- Install LTS version
- Restart computer

### **Step 3: Start Server**

**Windows (Easy Way):**
```batch
# Double-click this file:
START.bat
```

**Windows (Manual):**
```bash
npm install
npm start
```

**Mac/Linux:**
```bash
npm install
npm start
```

### **Step 4: Open Browser**
```
http://localhost:3000
```

**Done! 🎉**

---

## 📱 Network Access (Share with Students)

### **Get Your IP Address:**

**Windows:**
```batch
# Double-click:
GET_IP.bat

# Or manually:
ipconfig
# Look for: IPv4 Address (e.g., 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### **Share URL:**
```
http://192.168.1.100:3000
```
*(Replace with your IP)*

### **Firewall (Windows):**
```batch
# Run as Administrator:
netsh advfirewall firewall add rule name="MCQ System" dir=in action=allow protocol=TCP localport=3000
```

---

## 👥 Multi-Teacher Setup

### **Option 1: Single Server (Recommended)**

**Main Server Computer:**
1. Install system (ZIP + npm install)
2. Run `START.bat`
3. Note IP address (`GET_IP.bat`)

**Other Teachers:**
1. Open browser
2. Go to: `http://SERVER_IP:3000`
3. Click "Register new teacher account"
4. Create account
5. Login and use!

**Benefits:**
- ✅ One installation
- ✅ Everyone accesses via network
- ✅ Centralized data
- ✅ Easy management

### **Option 2: USB Portable**

See: [USB_AND_NETWORK_GUIDE.md](USB_AND_NETWORK_GUIDE.md)

---

## 📚 Documentation

- **[SIMPLE_SETUP_GUIDE.md](SIMPLE_SETUP_GUIDE.md)** - Non-technical setup guide
- **[USB_AND_NETWORK_GUIDE.md](USB_AND_NETWORK_GUIDE.md)** - Deployment options
- **[MULTI_TEACHER_GUIDE.md](MULTI_TEACHER_GUIDE.md)** - Multi-teacher setup
- **[DELETE_FUNCTIONALITY_UPDATE.md](DELETE_FUNCTIONALITY_UPDATE.md)** - Delete features

---

## 🎯 Usage Guide

### **For Teachers:**

1. **Register Account:**
   - Home page → Teacher Portal
   - Click "Register new teacher account"
   - Fill form → Register

2. **Add Courses:**
   - Login → Courses tab
   - Add: Mathematics, Physics, etc.

3. **Add Timings:**
   - Timings tab
   - Add: Morning (8AM-12PM), Evening (2PM-6PM)

4. **Create Test:**
   - Tests tab
   - Select course, timing, month
   - Leave unlock dates blank (or set dates)
   - Create Test

5. **Add Questions:**
   - Questions tab
   - Select test
   - Add minimum 10 questions
   - Fill question, options, correct answer

6. **View Results:**
   - Results tab
   - Filter by month
   - Export to Excel

### **For Students:**

1. **Open URL:**
   - `http://localhost:3000` (same computer)
   - `http://192.168.1.100:3000` (network)

2. **Student Portal:**
   - Enter Student ID
   - Enter Name
   - Select Course
   - Select Timing
   - Select Month

3. **Take Test:**
   - Click "Start Test"
   - Full-screen mode
   - 30-minute timer
   - Answer questions
   - Submit

4. **View Results:**
   - Score displayed
   - Percentage shown
   - Pass/Fail status

---

## 🔧 Technical Details

### **Tech Stack:**
- **Backend:** Node.js + Express
- **Database:** SQLite3
- **Frontend:** Vanilla JavaScript
- **Authentication:** JWT
- **Styling:** Custom CSS

### **Database Schema:**
- Organizations
- Teachers
- Courses
- Timings
- Tests
- Questions
- Student Attempts

### **Security:**
- Password hashing (bcrypt)
- JWT authentication
- SQL injection prevention
- XSS protection
- CSRF protection

---

## 📦 Project Structure

```
mcq-system/
├── public/
│   ├── index.html              # Home page
│   ├── teacher.html            # Teacher dashboard
│   ├── student.html            # Student test page
│   ├── register.html           # Teacher registration
│   ├── style.css               # Styles
│   ├── script.js               # Main JS
│   ├── teacher-script.js       # Teacher JS
│   └── student-script.js       # Student JS
├── server.js                   # Express server
├── package.json                # Dependencies
├── database.db                 # SQLite database (auto-created)
├── START.bat                   # Windows launcher
├── GET_IP.bat                  # IP address tool
├── OPEN_BROWSER.bat            # Browser opener
└── README.md                   # This file
```

---

## 🌐 Deployment Options

### **1. Local Network (School/Institute):**
- Install on one computer
- Share IP with students/teachers
- Same WiFi required

### **2. USB Portable:**
- Copy to USB drive
- Run from USB
- No installation needed
- See: [USB_AND_NETWORK_GUIDE.md](USB_AND_NETWORK_GUIDE.md)

### **3. Cloud Hosting (Internet):**

**Railway.app (Free):**
```bash
# 1. Push to GitHub
# 2. Connect Railway to GitHub
# 3. Deploy automatically
# URL: https://your-app.railway.app
```

**Render.com (Free):**
```bash
# 1. Push to GitHub
# 2. Create new Web Service
# 3. Connect repository
# URL: https://your-app.onrender.com
```

**VPS (DigitalOcean, AWS, etc.):**
```bash
# 1. SSH to server
# 2. Clone repository
# 3. npm install
# 4. npm start
# 5. Setup domain + SSL
```

---

## 🔒 Security Best Practices

### **Production Deployment:**

1. **Change JWT Secret:**
   ```javascript
   // In server.js
   const JWT_SECRET = 'your-super-secret-key-here';
   ```

2. **Use Environment Variables:**
   ```bash
   # Create .env file
   JWT_SECRET=your-secret-key
   PORT=3000
   NODE_ENV=production
   ```

3. **Enable HTTPS:**
   - Use reverse proxy (Nginx)
   - SSL certificate (Let's Encrypt)

4. **Database Backup:**
   ```bash
   # Backup database.db regularly
   cp database.db database_backup_$(date +%Y%m%d).db
   ```

5. **Firewall Rules:**
   - Allow only port 3000
   - Block direct database access

---

## 🐛 Troubleshooting

### **Problem: npm is not recognized**
**Solution:** Install Node.js from https://nodejs.org

### **Problem: Port 3000 already in use**
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <NUMBER> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### **Problem: Test not showing for students**
**Solution:**
1. Add minimum 10 questions
2. Check unlock dates (leave blank or set to today)
3. Verify course/timing/month match

### **Problem: Cannot access from other computers**
**Solution:**
1. Check same WiFi network
2. Verify IP address (GET_IP.bat)
3. Allow firewall (see above)
4. Restart server

---

## 📊 Demo Credentials

**Teacher Login:**
- Username: `teacher1`
- Password: `teacher123`

**Create New Teacher:**
- Home page → Teacher Portal
- Click "Register new teacher account"

---

## 🎯 Roadmap

- [ ] Question import from Excel
- [ ] Bulk question upload
- [ ] Question categories/tags
- [ ] Random question selection
- [ ] Negative marking option
- [ ] Student performance analytics
- [ ] Email notifications
- [ ] SMS integration
- [ ] Mobile app (React Native)
- [ ] Advanced reporting

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📄 License

MIT License - Free to use, modify, and distribute.

---

## 👨‍💻 Author

**Faris - Data Analyst**
- Email: thepersonalityschool43@gmail.com
- GitHub: [@FarisDataAnalysts](https://github.com/FarisDataAnalysts)

---

## 🙏 Support

If you find this helpful:
- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 📢 Share with others

---

## 📞 Contact

**Issues/Questions:**
- GitHub Issues: [Create Issue](https://github.com/FarisDataAnalysts/institute-mcq-test-system/issues)
- Email: thepersonalityschool43@gmail.com

---

**Made with ❤️ for Education | تعلیم کے لیے محبت سے بنایا گیا**

---

## 🎉 Quick Links

- [Download ZIP](https://github.com/FarisDataAnalysts/institute-mcq-test-system/archive/refs/heads/main.zip)
- [Simple Setup Guide](SIMPLE_SETUP_GUIDE.md)
- [USB & Network Guide](USB_AND_NETWORK_GUIDE.md)
- [Multi-Teacher Guide](MULTI_TEACHER_GUIDE.md)
- [Report Issue](https://github.com/FarisDataAnalysts/institute-mcq-test-system/issues)

---

**Version:** 1.0.0  
**Last Updated:** January 2026