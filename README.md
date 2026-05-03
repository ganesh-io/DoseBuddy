<div align="center">

<br/>

<img width="120" src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Graduation%20Cap.png"/>

# DoseBuddy V2

**Digital Student Portfolio & Skill Exchange Platform**

<br/>

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

<br/>

</div>

---

## 👥 Team

<div align="center">

| <img width="60" src="https://avatars.githubusercontent.com/yaswanth"/> | <img width="60" src="https://avatars.githubusercontent.com/ganesh-io"/> |
|:---:|:---:|
| **Yaswanth** | **Sai Ganesh** |
| S101 · CSE · Year 2 | S102 · CSE · Year 2 |
| [![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github)](https://github.com/yaswanth) | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github)](https://github.com/ganesh-io) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/saiganesh-s) |

</div>

---

## 🌟 What is DoseBuddy?

DoseBuddy is a **full-stack academic platform** for students that combines:

- 🎓 **Portfolio Building** — showcase skills, projects, certificates, internships
- 🔄 **Peer Skill Exchange** — teach what you know, learn what you need
- 🏢 **Company Matching** — browse 50 real Indian companies and apply
- 🤝 **Recruiter System** — separate portal for company recruiters

---

## ✨ Features at a Glance

<table>
<tr>
<td>

**🎓 Student Portal**
- 📊 Live Dashboard with stats
- 👤 Full Portfolio builder
- 🔄 Skill Exchange system
- 🤝 Peer learning sessions
- 🏢 50 companies to apply
- 🎨 6 aesthetic themes
- ⏰ Live IST clock

</td>
<td>

**🏢 Recruiter Portal**
- 🔍 Search candidates by skill/CGPA
- 📋 Shortlist and manage candidates
- 📅 Schedule interviews
- 📢 Post job openings
- 👁️ View all applicants per opening
- 📊 Recruitment dashboard

</td>
</tr>
</table>

---

## 🛠️ Tech Stack
┌─────────────────────────────────────────────┐
│                  DoseBuddy                  │
├──────────────┬──────────────┬───────────────┤
│   Frontend   │   Backend    │   Database    │
├──────────────┼──────────────┼───────────────┤
│ React 18     │ Node.js      │ MySQL 8.0     │
│ Vite         │ Express.js   │ 16 Tables     │
│ TailwindCSS  │ JWT Auth     │ 5 Triggers    │
│ Framer Motion│ bcryptjs     │ 3 Functions   │
│ Space Grotesk│ mysql2       │ 3 Procedures  │
│ Outfit Font  │ CORS         │ 2 Views       │
└──────────────┴──────────────┴───────────────┘

---

## 📁 Project Structure
DoseBuddy/
│
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 routes/
│   │   │   ├── auth.js           # Login + Register (auto role detect)
│   │   │   ├── students.js       # Student profile CRUD
│   │   │   ├── recruiters.js     # Recruiter profile CRUD
│   │   │   ├── skills.js         # Skills + teaching availability
│   │   │   ├── companies.js      # 50 companies + candidate search
│   │   │   ├── applications.js   # Apply + withdraw
│   │   │   ├── exchange.js       # Skill exchange requests
│   │   │   ├── matches.js        # Peer learning sessions
│   │   │   ├── projects.js       # Portfolio projects
│   │   │   ├── certificates.js   # Certificates
│   │   │   ├── internships.js    # Internship records
│   │   │   ├── feedback.js       # Session ratings
│   │   │   └── dashboard.js      # Stats + activity feed
│   │   ├── 📁 middleware/
│   │   │   └── auth.js           # JWT verification
│   │   ├── db.js                 # MySQL connection pool
│   │   └── server.js             # Express app entry
│   ├── .env.example              # ← Safe template
│   └── package.json
│
├── 📁 frontend/
│   └── 📁 src/
│       ├── 📁 pages/
│       │   ├── Landing.jsx       # Public landing page
│       │   ├── Auth.jsx          # Login + Register
│       │   ├── About.jsx         # Team + project info
│       │   ├── Help.jsx          # Help center
│       │   ├── Settings.jsx      # Themes + profile
│       │   ├── 📁 student/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Portfolio.jsx
│       │   │   ├── SkillExchange.jsx
│       │   │   ├── Matches.jsx
│       │   │   └── Companies.jsx
│       │   └── 📁 recruiter/
│       │       ├── RecruiterDashboard.jsx
│       │       ├── RecruiterProfile.jsx
│       │       ├── FindCandidates.jsx
│       │       ├── Shortlisted.jsx
│       │       └── Openings.jsx
│       ├── 📁 components/
│       │   ├── Sidebar.jsx
│       │   ├── Navbar.jsx
│       │   ├── ISTClock.jsx
│       │   └── ThemeSwitcher.jsx
│       └── 📁 contexts/
│           ├── AuthContext.jsx
│           └── ThemeContext.jsx
│
├── 📁 database/
│   └── dosebuddy_v2.sql          # Complete schema + seed data
│
├── .gitignore                    # ← Protects .env
├── README.md                     # ← This file
└── package.json

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://dev.mysql.com/downloads/) 8.0
- [Git](https://git-scm.com/)

### 1️⃣ Clone the repo
```bash
git clone https://github.com/ganesh-io/DoseBuddy.git
cd DoseBuddy
```

### 2️⃣ Setup Database
```bash
# Open MySQL Workbench or terminal
mysql -u root -p
# Then run:
source database/dosebuddy_v2.sql
# Or open the file in MySQL Workbench and execute
```

### 3️⃣ Setup Backend
```bash
cd backend
cp .env.example .env
# Open .env and fill in your MySQL password
npm install
npm run dev
# ✅ MySQL Connected
# 🚀 Server running at http://localhost:5000
```

### 4️⃣ Setup Frontend
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
# ➜ Local: http://localhost:5173
```

### 5️⃣ Open Browser
http://localhost:5173

---

## 🗄️ Database Design
16 Tables with complete relationships:
Core:        student, recruiter, skill
Portfolio:   student_skill, certificate, project
internship, student_intern, resume
Companies:   company, company_opening, application
shortlist
Exchange:    skill_exchange_request, skill_availability
skill_match, skill_feedback
Audit:       student_audit
Advanced SQL features used:
✅ Triggers (5)    ✅ Stored Functions (3)
✅ Procedures (3)  ✅ Views (2)
✅ Transactions    ✅ Table Locking
✅ Foreign Keys    ✅ ENUM types
✅ CHECK constraints

---

## 🎨 Themes

| Theme | Preview | Vibe |
|-------|---------|------|
| 🌌 Cosmos | Dark indigo | Default dark |
| ❄️ Snow | Pure white | Google/Notion style |
| 💜 Lavender | Soft purple | Pastel SaaS |
| 🌅 Sunset | Warm orange | Cozy dark |
| 🌊 Ocean | Deep teal | Professional |
| 🌸 Sakura | Blush pink | Japanese aesthetic |

---

## 🏢 Companies Included (50)

TCS · Infosys · Wipro · HCL · Tech Mahindra · Cognizant · Capgemini · Accenture · IBM · Microsoft · Google · Amazon · Flipkart · Paytm · PhonePe · Razorpay · Ola · Zomato · Swiggy · BYJU'S · Freshworks · Zoho · Meesho · CRED · Dream11 · Juspay · Ninjacart · ClearTax · Lenskart · HealthifyMe · Cure.fit · ShareChat · InMobi · Mu Sigma · Fractal Analytics · Mindtree · Mphasis · Persistent · Hexaware · EPAM · GlobalLogic · Sprinklr · Postman · Sarvam AI · Krutrim · Agnikul Cosmos · Ather Energy · Naukri · Dunzo · HasGeek

---

<div align="center">

**⭐ If you found this helpful, give it a star!**

<br/>

Made with ❤️ by **Yaswanth & Sai Ganesh**

</div>
