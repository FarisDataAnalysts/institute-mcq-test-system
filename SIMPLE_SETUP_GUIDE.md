# 🚀 Simple Setup Guide - بالکل آسان!

## ✅ **Kisi Ko Bhi De Sakte Ho - No PowerShell Needed!**

---

## 📥 **Step 1: Download Karo**

### **Method A: Direct ZIP**
1. **Is link pe click karo:**
   ```
   https://github.com/FarisDataAnalysts/institute-mcq-test-system/archive/refs/heads/main.zip
   ```

2. **ZIP download** ho jayega

3. **Right-click** → **Extract All**

4. **Folder rename** karo: `mcq-system`

---

### **Method B: GitHub Se**
1. **GitHub pe jao:**
   ```
   https://github.com/FarisDataAnalysts/institute-mcq-test-system
   ```

2. **Green "Code" button** → **Download ZIP**

3. **Extract** karo

---

## 💻 **Step 2: Node.js Install (Ek Baar Bas)**

### **Check Karo Installed Hai Ya Nahi:**

1. **Windows + R** press karo
2. Type: `cmd`
3. Enter press karo
4. Type: `node --version`

**Agar version dikhega** (e.g., v18.17.0) → **Skip karo Step 2**

**Agar error aaye** → **Neeche follow karo:**

---

### **Node.js Install Karo:**

1. **Website kholo:**
   ```
   https://nodejs.org
   ```

2. **Green button** "LTS" version download karo

3. **Downloaded file** pe double-click

4. **Next, Next, Install** karte jao

5. **Computer restart** karo

---

## 🎯 **Step 3: System Chalao (Super Easy!)**

### **Windows:**

1. **Folder open** karo: `mcq-system`

2. **Address bar** pe click karo (top pe jahan path dikhta hai)

3. Type karo: `cmd`

4. **Enter** press karo

5. **Black window** (Command Prompt) open hoga

6. Type karo:
   ```
   npm install
   ```

7. **Wait** karo 2-3 minutes (packages install ho rahe hain)

8. Phir type karo:
   ```
   npm start
   ```

9. **Done!** Server chal gaya! ✅

---

### **Mac/Linux:**

1. **Terminal** open karo

2. Type karo:
   ```bash
   cd path/to/mcq-system
   npm install
   npm start
   ```

---

## 🌐 **Step 4: Browser Mein Open Karo**

```
http://localhost:3000
```

**Beautiful home page** dikhega! 🎉

---

## 👨‍🏫 **Step 5: Teacher Account Banao**

### **Demo Account (Already Ready):**
- Username: `teacher1`
- Password: `teacher123`

### **Naya Teacher Account:**

1. **Home page** pe **"Teacher Portal"** click karo

2. **Neeche link** dikhega: **"Register new teacher account"**

3. **Click** karo

4. **Form fill** karo:
   - Full Name: `Mr. Khan`
   - Username: `teacher2`
   - Password: `teacher456`

5. **Register** button click

6. **Done!** Ab login karo

---

## 📱 **Network Pe Share Karo (Optional)**

### **Same WiFi Pe Students Ko Access:**

**Step 1: IP Address Nikalo**

1. **Windows + R** → `cmd` → Enter

2. Type: `ipconfig`

3. **IPv4 Address** dekho (e.g., `192.168.1.100`)

---

**Step 2: Firewall Allow Karo**

1. **Windows + R** → `cmd` → **Right-click** → **Run as Administrator**

2. Type:
   ```
   netsh advfirewall firewall add rule name="MCQ System" dir=in action=allow protocol=TCP localport=3000
   ```

3. Enter press karo

---

**Step 3: Students Ko URL Do**

```
http://192.168.1.100:3000
```

**(Apna IP use karo!)**

---

## 🎯 **Quick Start Checklist:**

- [ ] Node.js install kiya
- [ ] Folder download kiya
- [ ] `npm install` run kiya
- [ ] `npm start` run kiya
- [ ] Browser mein `localhost:3000` khola
- [ ] Teacher account banaya
- [ ] Course add kiya
- [ ] Test create kiya
- [ ] Questions add kiye (minimum 10)

---

## ✨ **Features Ready:**

### **Teacher Dashboard:**
✅ Add/Delete courses
✅ Add/Delete timings
✅ Create/Delete tests
✅ Add/Delete questions
✅ View results
✅ Export to Excel
✅ Register new teachers (no PowerShell!)

### **Student Portal:**
✅ Simple login
✅ Course/Timing/Month selection
✅ Timed test (30 min)
✅ Anti-cheat features
✅ Instant results

---

## 🔧 **Common Issues:**

### **Problem: "npm is not recognized"**
**Solution:** Node.js install nahi hai. Step 2 follow karo.

### **Problem: Port 3000 busy**
**Solution:** 
```bash
# CMD mein
netstat -ano | findstr :3000
taskkill /PID <NUMBER> /F
```

### **Problem: Test nahi dikh raha**
**Solution:**
1. Minimum 10 questions add karo
2. Unlock dates blank chhod do
3. Test delete karke naya banao

---

## 📞 **Help Chahiye?**

### **GitHub Issues:**
```
https://github.com/FarisDataAnalysts/institute-mcq-test-system/issues
```

### **Email:**
```
thepersonalityschool43@gmail.com
```

---

## 🎁 **Bonus: Production Deployment**

### **Free Hosting (Internet Pe):**

**Railway.app (Easiest):**
1. Railway.app pe account banao
2. "Deploy from GitHub" select karo
3. Repository connect karo
4. Automatic deploy!
5. URL mil jayega: `https://your-app.railway.app`

**Render.com:**
1. Render.com pe account banao
2. "New Web Service"
3. GitHub connect
4. Deploy!

---

## ✅ **Summary:**

1. ✅ **Download** → ZIP extract
2. ✅ **Install** → Node.js (ek baar)
3. ✅ **Run** → `npm install` → `npm start`
4. ✅ **Open** → `localhost:3000`
5. ✅ **Register** → New teacher account
6. ✅ **Use** → Add courses, tests, questions!

**Bas itna hi! Koi PowerShell, coding, ya technical knowledge nahi chahiye!** 🚀

---

**Made with ❤️ for Teachers | اساتذہ کے لیے محبت سے بنایا گیا**