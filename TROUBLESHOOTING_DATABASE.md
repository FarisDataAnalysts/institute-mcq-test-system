# 🔧 **Database Error Troubleshooting Guide**

---

## ❌ **Error: SQLITE_CANTOPEN**

```
Database error: [Error: SQLITE_CANTOPEN: unable to open database file]
errno: 14,
code: 'SQLITE_CANTOPEN'
```

---

## 🎯 **Quick Fix (90% Cases):**

### **Solution 1: Create Data Folder**

```batch
1. Project folder kholo

2. Check karo: "data" folder hai ya nahi?

3. Agar NAHI hai:
   - Right-click → New → Folder
   - Name: data
   - Enter

4. Server restart:
   - Ctrl+C (stop server)
   - START.bat (start again)

✅ Problem solved!
```

---

### **Solution 2: Use FIX_DATABASE.bat**

```batch
1. FIX_DATABASE.bat double-click karo

2. Script automatically:
   ✅ data folder banayega
   ✅ backups folder banayega
   ✅ database.db file banayega
   ✅ Permissions check karega

3. "FIX COMPLETE!" dikhe to:
   - Window close karo
   - START.bat run karo

✅ Problem solved!
```

---

## 🔍 **Detailed Solutions:**

### **Issue 1: Folder Missing**

**Symptoms:**
```
❌ data folder nahi hai
❌ Server start nahi ho raha
❌ SQLITE_CANTOPEN error
```

**Fix:**
```batch
# Manual Method:
1. Project folder mein jao
2. New folder banao: data
3. data folder ke andar: backups folder banao
4. Server restart karo

# Automatic Method:
1. FIX_DATABASE.bat run karo
2. Done!
```

---

### **Issue 2: Permission Denied**

**Symptoms:**
```
❌ Folder hai but error aa raha
❌ "Access denied" type message
❌ SQLITE_CANTOPEN error
```

**Fix:**
```batch
Method 1: Run as Administrator
1. START.bat pe right-click
2. "Run as Administrator"
3. Yes click karo
4. Server start hoga

Method 2: Fix Permissions
1. data folder pe right-click
2. Properties
3. Security tab
4. Edit button
5. Your username select
6. Full Control check karo
7. Apply → OK
8. Server restart
```

---

### **Issue 3: Antivirus Blocking**

**Symptoms:**
```
❌ Folder hai, permissions OK
❌ But still SQLITE_CANTOPEN
❌ Antivirus installed
```

**Fix:**
```batch
1. Antivirus temporarily disable:
   - Windows Defender:
     Settings → Update & Security
     → Windows Security
     → Virus & threat protection
     → Manage settings
     → Real-time protection OFF

2. Server start karo

3. Agar kaam kare:
   - Project folder ko exception mein add karo
   - Antivirus ON karo wapas

Exception Add Karna:
1. Antivirus settings
2. Exclusions/Exceptions
3. Add folder
4. Select project folder
5. Save
6. Server restart
```

---

### **Issue 4: Disk Full**

**Symptoms:**
```
❌ No space left on device
❌ Disk full error
❌ SQLITE_CANTOPEN
```

**Fix:**
```batch
1. Check disk space:
   - This PC → C: drive
   - Check free space

2. Agar kam hai (<1GB):
   - Delete unnecessary files
   - Empty Recycle Bin
   - Disk Cleanup run karo

3. Server restart
```

---

### **Issue 5: File Locked**

**Symptoms:**
```
❌ Database file locked
❌ Another process using it
❌ SQLITE_CANTOPEN
```

**Fix:**
```batch
1. Close all Node.js processes:
   - Ctrl+Alt+Delete
   - Task Manager
   - Find "Node.js"
   - End Task

2. Delete lock file (if exists):
   - data\database.db-journal
   - data\database.db-wal
   - data\database.db-shm

3. Server restart
```

---

### **Issue 6: Corrupted Database**

**Symptoms:**
```
❌ Database file exists but corrupted
❌ Can't open database
❌ SQLITE_CANTOPEN or SQLITE_CORRUPT
```

**Fix:**
```batch
Method 1: Restore from Backup
1. Stop server (Ctrl+C)
2. RESTORE_BACKUP.bat run karo
3. Latest backup select karo
4. Confirm
5. Server start

Method 2: Fresh Start
1. Stop server
2. Rename: data\database.db → database_old.db
3. Server start (new database banegi)
4. Re-register teacher account
5. Add data again
```

---

## 🛠️ **Advanced Troubleshooting:**

### **Check 1: Node.js Version**

```batch
node --version

Required: v14.0.0 or higher

Agar purana hai:
1. Download latest: https://nodejs.org
2. Install karo
3. Server restart
```

---

### **Check 2: SQLite3 Installation**

```batch
npm list sqlite3

Agar error:
npm install sqlite3 --save
npm start
```

---

### **Check 3: File Path Issues**

```batch
# Check current directory
cd

# Should be in project folder
# If not, navigate to project folder:
cd C:\path\to\institute-mcq-test-system

# Then start server
npm start
```

---

### **Check 4: Windows Long Path Issue**

```batch
# Enable long paths (Windows 10/11)
1. Win+R
2. Type: gpedit.msc
3. Enter
4. Navigate to:
   Computer Configuration
   → Administrative Templates
   → System
   → Filesystem
5. "Enable Win32 long paths"
6. Enable
7. OK
8. Restart computer
```

---

## 📋 **Diagnostic Checklist:**

```
☐ data folder exists?
☐ backups folder exists?
☐ database.db file exists?
☐ Write permissions OK?
☐ Running as Administrator?
☐ Antivirus not blocking?
☐ Disk space available (>1GB)?
☐ No other Node.js process running?
☐ Node.js version OK (v14+)?
☐ sqlite3 package installed?
☐ In correct directory?
```

---

## 🚨 **Emergency Recovery:**

### **If Nothing Works:**

```batch
1. Complete Fresh Install:
   
   a. Backup current folder (copy somewhere safe)
   
   b. Delete project folder
   
   c. Download fresh copy:
      https://github.com/FarisDataAnalysts/institute-mcq-test-system/archive/refs/heads/main.zip
   
   d. Extract to new location
   
   e. Open Command Prompt in new folder
   
   f. Run:
      npm install
      
   g. Create data folder:
      mkdir data
      mkdir data\backups
   
   h. Start server:
      npm start
   
   i. Should work now!

2. If still error:
   - Check antivirus
   - Run as Administrator
   - Check disk space
   - Restart computer
```

---

## 💡 **Prevention Tips:**

```
✅ Always run as Administrator (first time)
✅ Add project folder to antivirus exceptions
✅ Keep 2-3 GB free disk space
✅ Regular backups (BACKUP_SYSTEM.bat)
✅ Don't delete data folder
✅ Don't manually edit database.db
✅ Close server properly (Ctrl+C)
```

---

## 📞 **Still Having Issues?**

### **Collect This Information:**

```
1. Error message (full text)
2. Windows version
3. Node.js version (node --version)
4. Antivirus name
5. Disk free space
6. Screenshot of error
7. Screenshot of project folder
```

### **Then:**

```
1. Create GitHub Issue:
   https://github.com/FarisDataAnalysts/institute-mcq-test-system/issues

2. Include all information above

3. We'll help you fix it!
```

---

## 🎯 **Quick Reference:**

| Error | Most Likely Cause | Quick Fix |
|-------|------------------|-----------|
| SQLITE_CANTOPEN | data folder missing | Create data folder |
| SQLITE_CANTOPEN | Permission denied | Run as Administrator |
| SQLITE_CANTOPEN | Antivirus blocking | Add to exceptions |
| SQLITE_CANTOPEN | Disk full | Free up space |
| SQLITE_CANTOPEN | File locked | Close Node.js processes |
| SQLITE_CORRUPT | Database corrupted | Restore from backup |

---

**Most Common Fix: Create data folder + Run as Administrator! 🔧**

**90% problems solve ho jayengi! ✅**

**Agar nahi to FIX_DATABASE.bat run karo! 🚀**