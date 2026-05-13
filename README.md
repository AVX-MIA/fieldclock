# FieldClock — GPS Employee Time Tracking

A mobile-friendly time clock app with GPS stamping, service ticket linking, and PIN-based employee login.

---

## Deploy in 4 Steps

### Step 1 — Create a Firebase Project (free)

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it `fieldclock` → click through the setup
3. Once created, click **"Web"** (</>) to add a web app → name it → click **Register app**
4. Copy the `firebaseConfig` object shown — you'll need it in Step 3

### Step 2 — Set up Firestore Database

1. In the Firebase console sidebar, click **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** → select your region → **Enable**
4. Go to the **Rules** tab and replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ These rules are open for easy setup. After launch, tighten them using Firebase Auth.

5. Click **Publish**

### Step 3 — Add Your Firebase Config

Open `src/firebase.js` and replace the placeholder values with your actual config:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

### Step 4 — Change the Admin PIN

Open `src/App.jsx` and find this line near the top of the App component:

```js
const ADMIN_PIN = "0000"; // Change this!
```

Change `"0000"` to your own secret 4-digit PIN.

---

## Install & Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploy to Vercel (free hosting)

```bash
npm install -g vercel
vercel
```

Follow the prompts — Vercel will give you a live URL like `https://fieldclock.vercel.app`

**Or use the Vercel dashboard:**
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Click Deploy — done!

Share the URL with your employees. They can add it to their phone's home screen like an app:
- **iPhone**: Safari → Share → "Add to Home Screen"
- **Android**: Chrome → menu → "Add to Home Screen"

---

## How It Works

| Role | PIN | Access |
|------|-----|--------|
| Employee | Their 4-digit PIN (set by admin) | Clock in/out, view own records |
| Admin | Admin PIN (set in code) | All of the above + manage employees, view all records, export |

### Clock In Flow
1. Employee enters their PIN on the login screen
2. Selects a service ticket # and/or note (optional)
3. Taps **CLOCK IN** → app requests GPS → timestamp + coordinates saved to Firebase
4. Taps **CLOCK OUT** later → GPS captured again

### Log View
- GPS coordinates are clickable Google Maps links
- Compare clock-in location to your service ticket address visually

---

## Project Structure

```
fieldclock/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx       # React entry point
│   ├── App.jsx        # Main app (login, clock, log, admin)
│   └── firebase.js    # Firebase config ← fill this in!
└── README.md
```
