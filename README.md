# TripBuddy 🌍

> A full-stack travel planning web application with an admin approval workflow.

---

## Project Structure

```
TripBuddy/
├── frontend/               ← Static frontend (deployed on GitHub Pages)
│   ├── index.html          ← Main SPA entry point
│   ├── dashboard.html      ← User/Admin dashboard
│   ├── script.js           ← Frontend logic (auth, navigation, API calls)
│   ├── dashboard.js        ← Dashboard-specific logic
│   ├── style.css           ← Global styles
│   └── assets/
│       ├── logo.png
│       └── favicon.png
│
├── backend/                ← Node.js REST API (deployed on Vercel/Railway)
│   ├── server.js           ← Express app entry point
│   ├── package.json
│   ├── .env                ← ⚠️ Never commit this file
│   └── models/
│       ├── User.js         ← Mongoose User schema (auth + admin approval)
│       └── Trip.js         ← Mongoose Trip schema
│
├── design-mockups/         ← UI design references (dev only)
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | HTML, Vanilla JS, CSS             |
| Backend  | Node.js, Express.js               |
| Database | MongoDB Atlas (via Mongoose)      |
| Auth     | bcryptjs (passwords), JWT (tokens)|
| Email    | Nodemailer (Gmail SMTP)           |
| Hosting  | GitHub Pages (FE) + Vercel (BE)   |

---

## Getting Started

### Backend
```bash
cd backend
npm install
# Create a .env file (see .env.example)
npm start        # Production
npm run dev      # Development (uses nodemon)
```

### Frontend
Open `frontend/index.html` directly in a browser, or deploy to GitHub Pages.

---

## Environment Variables (`backend/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-github-pages-url
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="Your Name <your@email.com>"
```

> **Never commit `.env` to git.** Use the template above to create it locally.
