# 🛡️Veritas – Automated Evidence & Justice Engine🛡️

**Veritas** (meaning 'truth') is a web application designed to help survivors of online abuse turn messy evidence (screenshots, chats, files) into structured, court‑ready case files — and connect them to support resources (helplines, counseling, legal help).  
It aims to make digital justice and support accessible, especially for women and girls online.

---

## Table of Contents
* [Why Veritas?](#why-veritas)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Quick Setup](#quick-setup)
* [How to use](#how-to-use)
* [Live demo](#live-demo)
* [Collaboration Instructions (for Team)](#collaboration-instructions-for-team)
* [Acknowledgement](#acknowledgements)
* [License](#license)

---

## 💡Why Veritas?

Online abuse, harassment, doxxing, blackmail and other forms of digital violence are rapidly increasing — especially against women and girls. Survivors often don’t know where to start, don’t have the technical know‑how to organize evidence properly, or don’t know which resources to turn to for help.  

Veritas aims to solve this by offering:

- Easy file upload (images, videos, audio, documents)  
- Automated (or simulated) text extraction and content analysis  
- Structured storage of evidence + metadata in a secure backend  
- A simple case‑file system for organizing evidence by “case”  
- A “SupportBridge” resource directory to connect survivors with help (police, medical, counseling, legal, etc.)  
- A safety‑first design (privacy, optional anonymity, potential “quick hide” / panic features)  

---

## ✅Features

- User Authentication: Secure signup and login using Supabase.  
- Case Management: Create, update, and view cases efficiently.  
- Case Detail View: Access detailed information on individual cases.  
- Support Bridge: Real-time communication for assistance and guidance. 
- Panic Button: Immediate alert system for urgent situations.  
- Settings: Manage profile, preferences, and notifications.  
- Responsive Design: Works seamlessly on desktop and mobile devices.  

---

## 🛠️Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS  
- **Backend / Database**: Supabase (PostgreSQL + Storage + Auth)  
- **Deployment / Hosting**: Supabase + Static frontend (Vite)  
- **Icons / UI**: lucide‑react (for upload / file icons / UI controls)  

---

## 📥Quick Setup

1. Clone the repo:  
   ```bash
   git clone https://github.com/Waitherero-coder/Veritas.git
   cd Veritas
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file (in project folder) with your Supabase config:
   ```bash
   VITE_SUPABASE_URL=https://<YOUR-PROJECT-REF>.supabase.co  
   VITE_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
   ```
4. Make sure your Supabase project is ready
5. Start the dev server:
   ```bash
   npm run dev
   ```
Then open http://localhost:5173 (or as indicated) in your browser.

## 🎯How to Use
1. Launch the app.
2. Open the app in your browser.
3. Sign up or log in to your account. (Make sure you check your email for verification)
4. Navigate to Cases to view existing cases or add a new case.
5. Use the Support Bridge for communication or the Panic Button for urgent alerts.
6. Manage your preferences in Settings.

## 🚀Live demo
Click the link below:

[([https://veritas-stable.vercel.app/](https://veritas-stable.vercel.app/))]

## 🧑‍🤝‍🧑Collaboration Instructions(for Team)
* Everyone uses the same Supabase project — same VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
* Each member has their own .env, not committed to GitHub
* To start working: npm install → npm run dev
* When updating migrations / schema: commit to /supabase/migrations/, then run npx supabase db push
* If adding new features (components, UI, pages), create new branches and open Pull Requests

## 🌟Acknowledgements
1. Elizabeth Waithereru - Software Engineer/Full-stack Developer
2. Jane Muriithi - Software Engineer/Full-stack Developer
3. Shamim Kombo - Software Engineer/Full-stack Developer
4. Mitchell Rutto - Software Engineer
5. Samuel Kamawira - Software Engineer

## License
This project is licensed under the MIT License.
