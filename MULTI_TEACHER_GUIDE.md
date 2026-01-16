# 👥 Multi-Teacher Setup Guide

## 🎯 **Kya Aap Chahte Ho?**

### **Scenario 1: Same Computer, Different Teachers**
✅ **Haan, bilkul ho sakta hai!**

**Kaise:**
1. Teacher 1 login kare: `teacher1 / teacher123`
2. Apne courses, tests, questions add kare
3. Logout kare
4. Teacher 2 login kare: (naya account banao - neeche dekho)
5. Teacher 2 apne courses, tests add kare

**Data Isolation:**
- Teacher 1 ke questions Teacher 2 ko **NAHI** dikhenge
- Teacher 2 ke questions Teacher 1 ko **NAHI** dikhenge
- Har teacher ka data **completely separate** hai

---

### **Scenario 2: Different Computers/Browsers**
✅ **Haan, same localhost pe multiple browsers!**

**Example:**
- Computer 1: `http://localhost:3000` → Teacher 1 login
- Computer 2 (same network): `http://YOUR-IP:3000` → Teacher 2 login
- Mobile browser: `http://YOUR-IP:3000` → Students

**Network Setup:**
```bash
# Apna IP address dekho
ipconfig  # Windows
ifconfig  # Mac/Linux

# Example: 192.168.1.100
# Students access: http://192.168.1.100:3000
```

---

## 👨‍🏫 **Naye Teacher Account Kaise Banayein**

### **Method 1: Database Mein Manually Add (Easy)**

**Step 1: Server stop karo** (Ctrl+C)

**Step 2: SQLite browser install karo:**
- Download: https://sqlitebrowser.org/dl/
- Install karo

**Step 3: Database open karo:**
- File → Open Database
- Select: `database.db` (project folder mein)

**Step 4: Teachers table mein jao:**
- Browse Data tab
- Table: `teachers`

**Step 5: New teacher add karo:**
- "New Record" button
- Fill:
  - `org_id`: 1 (same organization)
  - `username`: teacher2
  - `password`: (encrypted - neeche dekho)
  - `name`: Mr. Khan

**Password Encrypt Kaise Karein:**

**Option A: Online Tool**
```
1. Website: https://bcrypt-generator.com/
2. Password enter karo: teacher456
3. Rounds: 10
4. Copy encrypted hash
5. Database mein paste karo
```

**Option B: Node.js Console**
```bash
node
> const bcrypt = require('bcryptjs');
> bcrypt.hashSync('teacher456', 10);
# Copy output aur database mein paste
```

---

### **Method 2: API Endpoint Banao (Advanced)**

Main aapke liye **registration API** bana deta hoon:

**File: `server.js` mein add karo:**

```javascript
// Teacher Registration (Add this after login route)
app.post('/api/teacher/register', async (req, res) => {
  const { username, password, name } = req.body;
  
  // Check if username exists
  db.get('SELECT * FROM teachers WHERE username = ?', [username], async (err, existing) => {
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new teacher (org_id = 1 for demo)
    db.run(
      'INSERT INTO teachers (org_id, username, password, name) VALUES (?, ?, ?, ?)',
      [1, username, hashedPassword, name],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Teacher registered successfully' });
      }
    );
  });
});
```

**Frontend: Registration page banao**

`public/register.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Teacher Registration</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="card" style="max-width: 500px; margin: 50px auto;">
            <h2>Teacher Registration</h2>
            <form onsubmit="register(event)">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="name" required>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="username" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn btn-success">Register</button>
            </form>
        </div>
    </div>
    
    <script>
        function register(e) {
            e.preventDefault();
            
            const data = {
                name: document.getElementById('name').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };
            
            fetch('/api/teacher/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('✅ Registration successful! You can now login.');
                    window.location.href = 'index.html';
                } else {
                    alert('Error: ' + (data.error || 'Registration failed'));
                }
            })
            .catch(err => alert('Error: ' + err.message));
        }
    </script>
</body>
</html>
```

**Access:**
```
http://localhost:3000/register.html
```

---

## 🔐 **Data Isolation Kaise Kaam Karta Hai**

### **Database Structure:**

```
Organization 1 (Demo Institute)
├── Teacher 1 (teacher1)
│   ├── Course: Mathematics
│   ├── Course: Physics
│   ├── Test 1: Math Month 1
│   │   └── Questions: 1-20
│   └── Test 2: Physics Month 1
│       └── Questions: 1-15
│
└── Teacher 2 (teacher2)
    ├── Course: Chemistry
    ├── Course: Biology
    ├── Test 1: Chemistry Month 1
    │   └── Questions: 1-18
    └── Test 2: Biology Month 1
        └── Questions: 1-12
```

### **Security:**

✅ **Teacher 1 login:**
- Sirf apne courses dikhenge
- Sirf apne tests dikhenge
- Sirf apne questions dikhenge
- Sirf apne students ke results dikhenge

✅ **Teacher 2 login:**
- Sirf apne courses dikhenge
- Teacher 1 ka kuch bhi **NAHI** dikhega

✅ **Students:**
- Sirf **unlocked tests** access kar sakte hain
- Kisi bhi teacher ke test de sakte hain (agar unlocked ho)

---

## 🌐 **Network Pe Share Kaise Karein**

### **Step 1: Apna IP Address Dekho**

**Windows:**
```bash
ipconfig
# Look for: IPv4 Address: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig
# Look for: inet 192.168.1.100
```

### **Step 2: Firewall Allow Karo**

**Windows:**
```bash
# PowerShell (Admin mode)
New-NetFirewallRule -DisplayName "MCQ System" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### **Step 3: Server Start Karo**

```bash
npm start
```

### **Step 4: Students Ko URL Do**

```
http://192.168.1.100:3000
```

**Same WiFi pe hone chahiye!**

---

## 📱 **Different Scenarios:**

### **Scenario A: School Computer Lab**
```
Teacher Computer: localhost:3000 (teacher login)
Student PC 1: 192.168.1.100:3000 (student test)
Student PC 2: 192.168.1.100:3000 (student test)
Student PC 3: 192.168.1.100:3000 (student test)
```

### **Scenario B: Home Network**
```
Laptop (Teacher): localhost:3000
Mobile (Student): 192.168.1.100:3000
Tablet (Student): 192.168.1.100:3000
```

### **Scenario C: Multiple Teachers**
```
Teacher 1 PC: localhost:3000 → Login: teacher1
Teacher 2 PC: 192.168.1.100:3000 → Login: teacher2
Students: 192.168.1.100:3000 → Take tests
```

---

## 🎯 **Quick Summary:**

### **Q1: Kya different teachers apne questions add kar sakte hain?**
✅ **Haan!** Har teacher ka data separate hai.

### **Q2: Kya students ko sab teachers ke questions dikhenge?**
✅ **Haan!** Students ko **unlocked tests** dikhenge (kisi bhi teacher ke).

### **Q3: Kya Teacher 1 ke questions Teacher 2 dekh sakta hai?**
❌ **Nahi!** Har teacher sirf apna data dekh sakta hai.

### **Q4: Kya same computer pe multiple teachers use kar sakte hain?**
✅ **Haan!** Login/logout karke.

### **Q5: Kya network pe share kar sakte hain?**
✅ **Haan!** IP address use karke.

---

## 🔧 **Production Setup (Internet Pe):**

Agar aap **internet pe** deploy karna chahte ho:

### **Option 1: Railway.app**
- Free hosting
- Automatic HTTPS
- Custom domain
- URL: `https://your-app.railway.app`

### **Option 2: Render.com**
- Free tier
- Auto-deploy from GitHub
- URL: `https://your-app.onrender.com`

### **Option 3: VPS (DigitalOcean)**
- $5/month
- Full control
- Custom domain: `https://yourdomain.com`

---

**Koi aur question?** 🚀