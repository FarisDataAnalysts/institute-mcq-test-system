# 🤖 AI Question Generator Setup Guide (FREE)

## ✨ **Google Gemini AI - COMPLETELY FREE!**

Yeh system **Google Gemini AI** use karta hai jo **BILKUL FREE** hai! 🎉

---

## 📋 **Step-by-Step Setup (5 Minutes)**

### **Step 1: Get FREE Gemini API Key** 🔑

1. **Website kholo:** https://makersuite.google.com/app/apikey
2. **Google account se login karo** (Gmail account)
3. **"Create API Key" button pe click karo**
4. **API key copy karo** (Looks like: `AIzaSyDGVJriOXSD-Zy-bLPKe...`)

**NOTE:** Yeh API key **COMPLETELY FREE** hai! No credit card needed! 💳❌

---

### **Step 2: Create .env File** 📝

1. **Project folder mein jao** (jahan `server.js` hai)
2. **New file banao** naam: `.env` (dot se shuru hoga)
3. **Yeh content paste karo:**

```env
# Google Gemini API Key (FREE)
GEMINI_API_KEY=YOUR_API_KEY_HERE

# Server Configuration
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

4. **`YOUR_API_KEY_HERE` ko replace karo** apni real API key se

**Example:**
```env
GEMINI_API_KEY=AIzaSyDGVJriOXSD-Zy-bLPKe-Zy8xQZ9Z9Z9Z9
PORT=3000
JWT_SECRET=my-secret-key-12345
```

---

### **Step 3: Install Dependencies** 📦

```bash
npm install
```

Yeh automatically install karega:
- ✅ `@google/generative-ai` (Gemini SDK)
- ✅ `dotenv` (Environment variables)

---

### **Step 4: Start Server** 🚀

```bash
npm start
```

**Success message dikhega:**
```
✅ Connected to database
🚀 Server running on http://localhost:3000
🤖 AI Features: ENABLED ✅
```

Agar "DISABLED" dikhe to `.env` file check karo!

---

## 🎯 **How to Use AI Generator**

### **Teacher Dashboard:**

1. **Login karo** teacher account se
2. **Questions tab** pe jao
3. **Test select karo** dropdown se
4. **AI Question Generator section** mein:
   - **Topic:** Enter karo (e.g., "Photosynthesis", "Newton's Laws")
   - **Difficulty:** Select karo (Easy/Medium/Hard)
   - **Count:** Kitne questions chahiye (1-20)
5. **Click:** "🤖 Generate Questions with AI"
6. **Wait:** 5-10 seconds
7. **Done!** Questions automatically save ho jayenge! ✅

---

## 💡 **Example Topics**

### **Science:**
- Photosynthesis
- Newton's Laws of Motion
- Chemical Reactions
- Human Body Systems
- Solar System

### **Math:**
- Algebra Basics
- Geometry Theorems
- Trigonometry
- Calculus Fundamentals
- Statistics

### **Computer Science:**
- Programming Basics
- Data Structures
- Algorithms
- Database Concepts
- Web Development

### **General Knowledge:**
- World History
- Geography
- Current Affairs
- Sports
- Literature

---

## 🔥 **Features**

✅ **100% FREE** - No credit card, no payment
✅ **Unlimited Questions** - Generate as many as you want
✅ **Smart AI** - Google's latest Gemini Pro model
✅ **Auto-Save** - Questions directly save to test
✅ **Quality Control** - AI validates all questions
✅ **Multiple Difficulty Levels** - Easy, Medium, Hard
✅ **Any Topic** - Science, Math, History, anything!

---

## ⚠️ **Troubleshooting**

### **Problem 1: "AI Features: DISABLED"**
**Solution:**
- Check `.env` file exists
- Check `GEMINI_API_KEY` is correct
- Restart server: `npm start`

### **Problem 2: "Failed to generate questions"**
**Solution:**
- Check internet connection
- Verify API key is valid
- Try again (sometimes AI takes time)

### **Problem 3: "Invalid API key"**
**Solution:**
- Get new API key from: https://makersuite.google.com/app/apikey
- Update `.env` file
- Restart server

---

## 📊 **API Limits (FREE Tier)**

Google Gemini FREE tier:
- ✅ **60 requests per minute**
- ✅ **1500 requests per day**
- ✅ **1 million tokens per month**

**Translation:** You can generate **THOUSANDS** of questions per day for FREE! 🎉

---

## 🎓 **Pro Tips**

1. **Be Specific:** "Photosynthesis in plants" better than just "Biology"
2. **Use English Topics:** AI works best with English
3. **Start Small:** Try 5 questions first, then increase
4. **Review Questions:** Always check AI-generated questions
5. **Mix Manual + AI:** Use both for best results

---

## 🆘 **Need Help?**

**Common Issues:**

1. **No .env file?**
   - Copy `.env.example` to `.env`
   - Add your API key

2. **API key not working?**
   - Generate new key
   - Make sure no spaces in key

3. **Questions not saving?**
   - Select test first
   - Check internet connection

---

## 🎉 **Success Checklist**

- [ ] Got Gemini API key
- [ ] Created `.env` file
- [ ] Added API key to `.env`
- [ ] Ran `npm install`
- [ ] Started server with `npm start`
- [ ] Saw "AI Features: ENABLED ✅"
- [ ] Generated first AI questions
- [ ] Questions saved successfully

---

## 🚀 **You're Ready!**

Ab aap **unlimited AI-powered questions** generate kar sakte ho - **COMPLETELY FREE!** 🎊

Happy Teaching! 👨‍🏫✨