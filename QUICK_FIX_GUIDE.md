# 🔧 **Quick Fix Guide - Common Errors**

---

## ❌ **Error 1: "Cannot read properties of undefined (reading 'name')"**

### **Problem:**
Registration form error when submitting.

### **Solution:**
✅ **FIXED!** Download latest version.

**What was wrong:**
- Error handling not proper
- Response validation missing

**What's fixed:**
- Better error handling
- Proper validation
- Clear error messages
- Real-time field validation

---

## ❌ **Error 2: "Invalid credentials" for Demo Login**

### **Problem:**
Demo login (teacher1 / teacher123) not working.

### **Why:**
Demo teacher doesn't exist in fresh database.

### **Solution:**

**Option 1: Register New Account (Recommended)**
```
1. Click "Register new teacher account"
2. Fill form:
   - Name: Your Name
   - Username: teacher1 (or any username)
   - Password: teacher123 (or any password)
3. Click Register
4. Login with your credentials
✅ Done!
```

**Option 2: Create Demo Teacher Manually**
```
1. Register with these details:
   - Name: Demo Teacher
   - Username: teacher1
   - Password: teacher123
2. Now demo login will work
✅ Done!
```

---

## ❌ **Error 3: "SQLITE_CANTOPEN"**

### **Problem:**
Database file can't be created/opened.

### **Solution:**
```
1. Create "data" folder in project directory
2. Run as Administrator
3. Restart server
✅ Done!

OR

1. Double-click FIX_DATABASE.bat
2. Restart server
✅ Done!
```

**See:** TROUBLESHOOTING_DATABASE.md for details

---

## ❌ **Error 4: Server Won't Start**

### **Problem:**
```
Error: Cannot find module 'express'
OR
Error: Port 3000 already in use
```

### **Solution:**

**For "Cannot find module":**
```
1. Open Command Prompt in project folder
2. Run: npm install
3. Wait for completion
4. Run: npm start
✅ Done!
```

**For "Port already in use":**
```
1. Close all Node.js processes:
   - Ctrl+Alt+Delete
   - Task Manager
   - Find "Node.js"
   - End Task

2. Restart server:
   - Double-click START.bat
✅ Done!
```

---

## ❌ **Error 5: Registration Not Working**

### **Problem:**
Form submits but nothing happens or error shows.

### **Solution:**
```
1. Check all fields filled:
   ✅ Name (minimum 3 characters)
   ✅ Username (minimum 3 characters, alphanumeric only)
   ✅ Password (minimum 6 characters)
   ✅ Confirm Password (must match)

2. Check username format:
   ✅ Only letters and numbers
   ❌ No spaces
   ❌ No special characters

3. Check password match:
   ✅ Both passwords exactly same

4. If still error:
   - Check console (F12)
   - Check server running
   - Restart server
```

---

## ❌ **Error 6: Can't Access from Other PC**

### **Problem:**
Teachers/students can't access from their PCs.

### **Solution:**
```
1. Check same WiFi:
   ✅ All devices on same network

2. Check IP address:
   - Run GET_IP.bat
   - Share correct IP with others
   - Format: http://192.168.1.100:3000

3. Check firewall:
   - Allow Node.js in Windows Firewall
   - Allow port 3000

4. Check server running:
   - Should see "Server running on..."
   - No errors in console

See: CENTRALIZED_SYSTEM_GUIDE.md for details
```

---

## ❌ **Error 7: AI Features Not Working**

### **Problem:**
```
Error: AI service not available
```

### **Solution:**
```
1. Get API key:
   - https://makersuite.google.com/app/apikey
   - Sign in with Google
   - Create API key
   - Copy it

2. Create .env file:
   - In project root
   - Add: GEMINI_API_KEY=your-key-here
   - Save

3. Restart server:
   - Ctrl+C
   - START.bat

4. Check console:
   - Should see: "✅ AI Service initialized"

See: AI_SETUP_GUIDE.md for details
```

---

## ❌ **Error 8: Backup Not Working**

### **Problem:**
BACKUP_SYSTEM.bat shows error.

### **Solution:**
```
1. Check data folder exists:
   - Should have data/database.db

2. Run as Administrator:
   - Right-click BACKUP_SYSTEM.bat
   - Run as Administrator

3. Check disk space:
   - Need at least 100MB free

4. Check permissions:
   - data folder should be writable

See: BACKUP_SIMPLE_URDU.md for details
```

---

## 🎯 **Quick Checklist:**

### **Before Starting:**
```
☐ Node.js installed (v14+)
☐ npm install completed
☐ data folder exists
☐ No other server on port 3000
☐ Firewall configured (if network access needed)
```

### **For Registration:**
```
☐ All fields filled correctly
☐ Username alphanumeric only
☐ Password minimum 6 characters
☐ Passwords match
☐ Server running
```

### **For Login:**
```
☐ Account registered first
☐ Correct username
☐ Correct password
☐ Server running
```

### **For Network Access:**
```
☐ Same WiFi
☐ Correct IP address
☐ Server running
☐ Firewall allows
```

---

## 📞 **Still Having Issues?**

### **Collect This Info:**

```
1. Error message (exact text)
2. Screenshot of error
3. What you were doing
4. Windows version
5. Node.js version (node --version)
6. Browser (Chrome/Firefox/Edge)
```

### **Then:**

```
1. Check relevant guide:
   - TROUBLESHOOTING_DATABASE.md (database errors)
   - AI_SETUP_GUIDE.md (AI errors)
   - BACKUP_SIMPLE_URDU.md (backup errors)
   - CENTRALIZED_SYSTEM_GUIDE.md (network errors)

2. Create GitHub Issue:
   - https://github.com/FarisDataAnalysts/institute-mcq-test-system/issues
   - Include all info above
   - We'll help you!
```

---

## 💡 **Prevention Tips:**

```
✅ Always run as Administrator (first time)
✅ Create data folder before starting
✅ Install all dependencies (npm install)
✅ Check Node.js version (v14+)
✅ Use strong passwords (6+ characters)
✅ Regular backups (weekly)
✅ Keep system updated
```

---

## 🎯 **Summary:**

| Error | Quick Fix | Time |
|-------|-----------|------|
| **Registration error** | Download latest version | 2 min |
| **Demo login fails** | Register new account | 1 min |
| **Database error** | Create data folder | 1 min |
| **Server won't start** | npm install | 3 min |
| **Network access** | Check WiFi + IP | 2 min |
| **AI not working** | Add API key to .env | 5 min |
| **Backup fails** | Run as Administrator | 1 min |

---

**Most errors fixed in 1-5 minutes! 🚀**

**Download latest version for all fixes! ✅**

**Still stuck? Check detailed guides! 📚**