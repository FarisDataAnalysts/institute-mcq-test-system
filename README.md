# 🎓 Institute MCQ Test System - مکمل آن لائن ٹیسٹ سسٹم

**Complete Online MCQ Test System for Educational Institutes**

[![Download](https://img.shields.io/badge/Download-ZIP-green)](https://github.com/FarisDataAnalysts/institute-mcq-test-system/archive/refs/heads/main.zip)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📥 **Download & Setup (اردو میں)**

### **Step 1: Code Download Karo**

**Option A: Direct ZIP Download**
1. [Is link pe click karo](https://github.com/FarisDataAnalysts/institute-mcq-test-system/archive/refs/heads/main.zip) - ZIP download ho jayega
2. ZIP file ko **Extract** karo (Right-click → Extract All)
3. Folder ka naam change karo: `mcq-system` (simple naam)

**Option B: Git Clone**
```bash
git clone https://github.com/FarisDataAnalysts/institute-mcq-test-system.git
cd institute-mcq-test-system
```

---

### **Step 2: Node.js Install Karo (Agar nahi hai)**

**Check karo installed hai ya nahi:**
```bash
node --version
```

**Agar error aaye toh:**
1. [Node.js Download karo](https://nodejs.org) - LTS version
2. Install karo (Next, Next, Install)
3. Computer restart karo

---

### **Step 3: Folder Mein Jao**

**Windows:**
1. Folder open karo
2. Address bar pe click karo (top pe)
3. Type karo: `cmd` aur Enter
4. Command Prompt open ho jayega

**Mac/Linux:**
```bash
cd path/to/mcq-system
```

---

### **Step 4: Dependencies Install Karo**

**PowerShell/CMD mein type karo:**
```bash
cd "C:\Users\YourName\Desktop\mcq-system"
npm install
```

**Wait karo 2-3 minutes** - packages install ho rahe hain

---

### **Step 5: Server Start Karo**

```bash
npm start
```

**Yeh dikhega:**
```
✅ Database connected
✅ Demo data created
📝 Demo Login: teacher1 / teacher123
🚀 Server running on http://localhost:3000
```

---

### **Step 6: Browser Mein Open Karo**

```
http://localhost:3000
```

**Demo Login:**
- Username: `teacher1`
- Password: `teacher123`

---

## ✨ **Features (خصوصیات)**

### **👨‍🎓 Student Portal (طالب علم پورٹل)**

✅ **Login System:**
- Student ID aur naam se login
- Course dropdown se select
- Timing dropdown se select
- Month select (1-4)

✅ **Test Features:**
- 30 minute timer (customizable)
- 10-20 MCQ questions
- Full-screen mode (compulsory)
- Copy/paste disabled
- Tab switch detection
- Auto-submit after 2 warnings
- Progress bar
- Question navigation
- Instant results

✅ **Anti-Cheat:**
- Copy disabled
- Paste disabled
- Right-click disabled
- Keyboard shortcuts blocked
- Tab switch warning
- Fullscreen enforcement
- Back button disabled

✅ **Multi-language:**
- English/Urdu support
- Translation button (ready for Google Translate API)

---

### **👨‍🏫 Teacher Dashboard (استاد ڈیش بورڈ)**

✅ **Overview Tab:**
- Total courses count
- Total tests count
- Total questions count
- Students tested count
- Quick action buttons

✅ **Courses & Timings:**
- Add unlimited courses
- Add unlimited timings
- View all courses/timings
- Simple management

✅ **Test Management:**
- Create tests
- Select course & timing
- Assign month (1-4)
- Set unlock dates
- Set test duration
- View all tests

✅ **Question Bank:**
- Add questions (MCQ format)
- 4 options (A, B, C, D)
- Set correct answer
- Edit questions
- Delete questions
- View all questions
- Minimum 10 questions required

✅ **Results & Analytics:**
- View all student results
- Filter by month
- Export to Excel/CSV
- Student-wise performance
- Pass/fail status
- Percentage calculation
- Date/time stamps

---

### **🔐 Data Security (ڈیٹا سیکیورٹی)**

✅ **Organization Level:**
- Each institute has separate data
- No data mixing between organizations

✅ **Teacher Level:**
- Each teacher sees only their data
- Teacher A cannot see Teacher B's questions
- Complete isolation

✅ **Student Level:**
- Students only access unlocked tests
- Cannot see future tests
- Secure test submission

---

## 📂 **Project Structure**

```
institute-mcq-test-system/
├── server.js                 # Main backend server
├── package.json              # Dependencies
├── database.db               # SQLite database (auto-created)
├── public/
│   ├── index.html           # Home page
│   ├── test.html            # Student test page
│   ├── teacher.html         # Teacher dashboard
│   ├── style.css            # Main styles
│   ├── script.js            # Home page JS
│   ├── test-script.js       # Test functionality
│   └── teacher-script.js    # Dashboard functionality
└── README.md                # This file
```

---

## 🌐 **Domain Pe Host Kaise Karein**

### **Option 1: Railway.app (Free & Easy)**

1. [Railway.app](https://railway.app) pe account banao
2. "New Project" → "Deploy from GitHub"
3. Repository select karo
4. Automatic deploy!
5. Custom domain add karo (optional)

**Cost:** Free tier available

---

### **Option 2: Render.com (Free)**

1. [Render.com](https://render.com) pe account banao
2. "New" → "Web Service"
3. GitHub connect karo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Deploy!

**Cost:** Free tier available

---

### **Option 3: VPS (DigitalOcean, Linode, etc.)**

**Server Setup:**
```bash
# SSH login
ssh root@your-server-ip

# Node.js install
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Code download
git clone https://github.com/FarisDataAnalysts/institute-mcq-test-system.git
cd institute-mcq-test-system

# Install dependencies
npm install

# PM2 install (process manager)
sudo npm install -g pm2

# Start application
pm2 start server.js --name mcq-system

# Auto-restart on reboot
pm2 startup
pm2 save
```

**Domain Setup with Nginx:**
```bash
# Nginx install
sudo apt install nginx

# Config file banao
sudo nano /etc/nginx/sites-available/mcq-system
```

**Paste this:**
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

**Enable & SSL:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mcq-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL Certificate (HTTPS)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**Cost:** $5-10/month

---

## 🎯 **Usage Guide (استعمال کی رہنمائی)**

### **For Teachers (اساتذہ کے لیے):**

**1. Login:**
- Username: `teacher1`
- Password: `teacher123`

**2. Add Courses:**
- Courses tab pe jao
- Course name enter karo (e.g., Mathematics)
- "Add Course" click karo

**3. Add Timings:**
- Timing enter karo (e.g., Morning 8AM-12PM)
- "Add Timing" click karo

**4. Create Test:**
- Tests tab pe jao
- Course select karo
- Timing select karo
- Month select karo (1-4)
- Unlock dates set karo (optional)
- Duration set karo (default 30 min)
- "Create Test" click karo

**5. Add Questions:**
- Questions tab pe jao
- Test select karo
- Question enter karo
- 4 options enter karo (A, B, C, D)
- Correct answer select karo
- "Add Question" click karo
- **Minimum 10 questions** add karo

**6. View Results:**
- Results tab pe jao
- Month filter karo (optional)
- "Export to Excel" click karo

---

### **For Students (طلباء کے لیے):**

**1. Home Page:**
- "Student Portal" click karo

**2. Login:**
- Student ID enter karo
- Name enter karo
- Course select karo
- Timing select karo
- Month select karo
- "Start Test" click karo

**3. Test:**
- Full-screen mode automatic
- Timer start hoga
- Har question answer karo
- "Next" button se aage baro
- Last question pe "Submit Test"

**4. Results:**
- Instant results dikhenge
- Score aur percentage

---

## ⚙️ **Configuration (ترتیبات)**

### **Change Port:**
`server.js` mein:
```javascript
const PORT = process.env.PORT || 3000; // Change to 8080, 5000, etc.
```

### **Change JWT Secret:**
`server.js` mein:
```javascript
const JWT_SECRET = 'your-super-secret-key-here-change-this';
```

### **Change Test Duration:**
Teacher dashboard se test create karte waqt duration set karo.

### **Add More Months:**
Currently 4 months. Code mein easily extend kar sakte ho.

---

## 🔧 **Troubleshooting (مسائل کا حل)**

### **Problem: "npm is not recognized"**
**Solution:** Node.js install nahi hai. [Download karo](https://nodejs.org)

### **Problem: "Port 3000 already in use"**
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### **Problem: "Cannot find module"**
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### **Problem: "Database locked"**
**Solution:**
```bash
rm database.db
npm start
```

### **Problem: Folder name mein space hai**
**Solution:**
```bash
cd "C:\Users\Name\Desktop\folder with spaces"
```
Ya folder rename karo (no spaces).

---

## 📊 **Database Schema**

```sql
organizations       # Institutes
├── teachers       # Teacher accounts
│   ├── courses    # Courses per teacher
│   ├── timings    # Timings per teacher
│   └── tests      # Tests per teacher
│       └── questions  # Questions per test
└── student_attempts   # Test results
```

---

## 🚀 **Production Deployment Checklist**

- [ ] Change JWT_SECRET
- [ ] Use PostgreSQL/MySQL instead of SQLite
- [ ] Setup HTTPS/SSL
- [ ] Setup backup system
- [ ] Add email notifications
- [ ] Setup monitoring (PM2, New Relic)
- [ ] Configure firewall
- [ ] Setup CDN (optional)
- [ ] Add rate limiting
- [ ] Setup logging

---

## 📱 **Future Features (آنے والی خصوصیات)**

- [ ] Image support in questions
- [ ] Video explanations
- [ ] Practice mode
- [ ] Leaderboard
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Bulk question upload (Excel)
- [ ] Question categories
- [ ] Difficulty levels

---

## 📄 **License**

MIT License - Free to use for personal and commercial projects.

---

## 🤝 **Support**

**Issues:** [GitHub Issues](https://github.com/FarisDataAnalysts/institute-mcq-test-system/issues)

**Email:** support@yourdomain.com

---

## 🎓 **Credits**

Created with ❤️ for educational institutes worldwide.

**Special Thanks:**
- Node.js Community
- Express.js Team
- SQLite Team

---

## 📞 **Contact**

For customization, support, or queries:
- GitHub: [@FarisDataAnalysts](https://github.com/FarisDataAnalysts)
- Email: thepersonalityschool43@gmail.com

---

## ⭐ **Star This Repo**

Agar yeh system helpful laga toh GitHub pe **Star** zaroor dena! 🌟

---

**Made in Pakistan 🇵🇰 | بنایا گیا پاکستان میں**