# 🎓 Institute MCQ Test System with FREE AI 🤖

A complete web-based Multiple Choice Question (MCQ) test management system for educational institutes with **FREE AI-powered question generation**. Teachers can create tests, generate questions using AI, manage content, and view results. Students can take timed tests with anti-cheat features.

**بالکل آسان MCQ ٹیسٹ سسٹم - اساتذہ اور طلباء کے لیے - مفت AI کے ساتھ!**

---

## ✨ Features

### 🤖 **NEW: AI Question Generator (100% FREE!)**
- ✅ **Auto-Generate Questions** - AI creates MCQs from any topic
- ✅ **Google Gemini Powered** - Latest AI technology
- ✅ **Completely FREE** - No credit card needed
- ✅ **Unlimited Questions** - Generate as many as you want
- ✅ **Smart & Accurate** - High-quality educational questions
- ✅ **Multiple Difficulty Levels** - Easy, Medium, Hard
- ✅ **Any Subject** - Science, Math, History, anything!
- ✅ **Instant Save** - Questions auto-save to your test

### 👨‍🏫 **Teacher Dashboard**
- ✅ **Easy Registration** - No PowerShell or technical knowledge needed
- ✅ **Course Management** - Add/Delete courses
- ✅ **Timing Management** - Add/Delete class timings
- ✅ **Test Creation** - Create tests with unlock dates
- ✅ **Question Bank** - Add/Delete unlimited questions
- ✅ **Manual + AI Questions** - Mix both for best results
- ✅ **Results Dashboard** - View student performance
- ✅ **Excel Export** - Download results as CSV
- ✅ **Multi-Teacher Support** - Complete data isolation
- ✅ **Month-wise Organization** - Filter by month

### 👨‍🎓 **Student Portal**
- ✅ **Simple Login** - Student ID + Name
- ✅ **Course Selection** - Choose course, timing, month
- ✅ **Timed Tests** - Configurable countdown timer
- ✅ **Full-Screen Mode** - Minimize distractions
- ✅ **Anti-Cheat** - Tab switch detection
- ✅ **Progress Tracking** - See answered questions
- ✅ **Instant Results** - Score and percentage
- ✅ **Mobile Friendly** - Works on phones/tablets

---

## 🚀 Quick Start (4 Steps!)

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

### **Step 3: Setup AI (Optional but Recommended - 100% FREE!)**

**Quick Setup (Windows):**
```batch
# Double-click this file:
SETUP_AI_QUICK.bat
```

**Manual Setup:**
1. Get FREE API key: https://makersuite.google.com/app/apikey
2. Create `.env` file in project folder
3. Add this:
```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
JWT_SECRET=your-secret-key
```

**Detailed Guide:** See [SETUP_AI.md](SETUP_AI.md)

### **Step 4: Start Server**

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

### **Step 5: Open Browser**
```
http://localhost:3000
```

**Done! 🎉**

**Look for:** `🤖 AI Features: ENABLED ✅` in console

---

## 🤖 Using AI Question Generator

### **Quick Guide:**

1. **Login** as teacher
2. Go to **Questions** tab
3. **Select a test** from dropdown
4. In **AI Question Generator** section:
   - **Topic:** Enter topic (e.g., "Photosynthesis")
   - **Difficulty:** Choose Easy/Medium/Hard
   - **Count:** How many questions (1-20)
5. Click **"🤖 Generate Questions with AI"**
6. Wait 5-10 seconds
7. **Done!** Questions auto-saved! ✅

### **Example Topics:**
- Science: "Photosynthesis", "Newton's Laws", "Chemical Reactions"
- Math: "Algebra Basics", "Geometry", "Trigonometry"
- History: "World War 2", "Ancient Egypt", "Industrial Revolution"
- Computer: "Programming Basics", "Data Structures", "Web Development"

### **Pro Tips:**
- ✅ Be specific: "Photosynthesis in plants" > "Biology"
- ✅ Use English topics for best results
- ✅ Start with 5 questions, then increase
- ✅ Review AI questions before test
- ✅ Mix AI + Manual questions

**Full Guide:** [SETUP_AI.md](SETUP_AI.md)

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
2. Setup AI (optional - FREE!)
3. Run `START.bat`
4. Note IP address (`GET_IP.bat`)

**Other Teachers:**
1. Open browser
2. Go to: `http://SERVER_IP:3000`
3. Click "Register new teacher account"
4. Create account
5. Login and use!
6. **AI works for everyone!** 🤖

**Benefits:**
- ✅ One installation
- ✅ Everyone accesses via network
- ✅ Centralized data
- ✅ Easy management
- ✅ Shared AI features

### **Option 2: USB Portable**

See: [USB_AND_NETWORK_GUIDE.md](USB_AND_NETWORK_GUIDE.md)

---

## 📚 Documentation

- **[SETUP_AI.md](SETUP_AI.md)** - AI setup guide (Urdu + English)
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
   - Set duration (default 30 min)
   - Leave unlock dates blank (or set dates)
   - Create Test

5. **Add Questions (2 Ways):**

   **Option A: AI Generator (Recommended)** 🤖
   - Questions tab
   - Select test
   - Enter topic in AI section
   - Choose difficulty
   - Set count (1-20)
   - Click "Generate with AI"
   - Review and done!

   **Option B: Manual Entry**
   - Questions tab
   - Select test
   - Fill question, options, correct answer
   - Add Question

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
   - Timed countdown
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
- **AI:** Google Gemini Pro (FREE)
- **Frontend:** Vanilla JavaScript
- **Authentication:** JWT
- **Styling:** Custom CSS

### **Database Schema:**
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
- Environment variables

### **AI Features:**
- Google Generative AI SDK
- Gemini Pro model
- JSON response parsing
- Auto-validation
- Error handling

---

## 📦 Project Structure

```
mcq-system/
├── public/
│   ├── index.html              # Home page
│   ├── teacher.html            # Teacher dashboard (with AI)
│   ├── student.html            # Student test page
│   ├── register.html           # Teacher registration
│   ├── style.css               # Styles
│   ├── script.js               # Main JS
│   ├── teacher-script.js       # Teacher JS (AI integration)
│   └── student-script.js       # Student JS
├── data/
│   └── database.db             # SQLite database
├── server.js                   # Express server (AI endpoints)
├── package.json                # Dependencies
├── .env                        # Environment variables (API keys)
├── .env.example                # Example env file
├── START.bat                   # Quick start (Windows)
├── SETUP_AI_QUICK.bat          # AI setup (Windows)
├── GET_IP.bat                  # Get IP address
├── README.md                   # This file
└── SETUP_AI.md                 # AI setup guide
```

---

## 🆓 AI Pricing & Limits

### **Google Gemini FREE Tier:**
- ✅ **60 requests per minute**
- ✅ **1,500 requests per day**
- ✅ **1 million tokens per month**

**Translation:** Generate **THOUSANDS** of questions daily - **100% FREE!** 🎉

**No credit card. No payment. Forever free!**

---

## 🎓 Example Use Cases

### **Scenario 1: Quick Test Creation**
1. Create test for "Physics - Month 1"
2. Use AI: Topic "Newton's Laws", Medium, 10 questions
3. Review questions
4. Test ready in 2 minutes! ⚡

### **Scenario 2: Mixed Questions**
1. Generate 15 AI questions (Easy)
2. Add 5 manual questions (Hard)
3. Total: 20 balanced questions
4. Best of both worlds! 🎯

### **Scenario 3: Multiple Topics**
1. Generate 5 questions: "Photosynthesis"
2. Generate 5 questions: "Respiration"
3. Generate 5 questions: "Cell Structure"
4. Complete Biology test! 📚

---

## ⚠️ Troubleshooting

### **AI Not Working?**

**Check 1: API Key**
```bash
# Open .env file
# Verify GEMINI_API_KEY is set
```

**Check 2: Console Message**
```
Look for: 🤖 AI Features: ENABLED ✅
If DISABLED: Check .env file
```

**Check 3: Internet**
- AI needs internet connection
- Check firewall settings

**Check 4: API Key Valid**
- Get new key: https://makersuite.google.com/app/apikey
- Update .env
- Restart server

### **Other Issues:**

See: [TROUBLESHOOTING_DATABASE.md](TROUBLESHOOTING_DATABASE.md)

---

## 🌟 What's New in v2.0

- 🤖 **FREE AI Question Generator** (Google Gemini)
- ✅ Improved registration validation
- ✅ Flexible question limits (min 1 question)
- ✅ Better error handling
- ✅ Enhanced UI for AI features
- ✅ Environment variables support
- ✅ Quick setup scripts

---

## 📞 Support

**Issues?**
- Check [SETUP_AI.md](SETUP_AI.md)
- Check [TROUBLESHOOTING_DATABASE.md](TROUBLESHOOTING_DATABASE.md)
- Create GitHub issue

**Questions?**
- Read documentation
- Check examples
- Ask in issues

---

## 📄 License

MIT License - Free to use, modify, and distribute!

---

## 🎉 Credits

- **AI:** Google Gemini Pro
- **Framework:** Node.js + Express
- **Database:** SQLite3
- **Made with ❤️ for Education**

---

## 🚀 Get Started Now!

1. **Download** the ZIP
2. **Install** Node.js
3. **Setup AI** (5 minutes - FREE!)
4. **Run** START.bat
5. **Create** amazing tests with AI! 🤖✨

**Happy Teaching! 👨‍🏫📚**