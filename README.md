# VidyaAI v3 — Frontend

## Files
- `index.html` — Login/Registration page (Student + Teacher)
- `platform.html` — Main app (Dashboard, Lessons, Quiz, Lab, AI Tutor, Offline)

## How to run

Simply open `index.html` in a browser. No build step required.

## Features

### Authentication
- Student: Register/Login with custom username & password
- Teacher: Register/Login with custom Teacher ID & password  
- NO hardcoded demo credentials — create your own account
- Persistent via localStorage

### Dashboard
- All stats start at 0 for new users
- Streak, XP, progress update as you learn
- Concept gap chart updates from actual quiz results

### Lessons
- All lessons start "not done" for every new user
- ← Back to Lessons button in lesson viewer
- Completing a lesson: +30 XP

### Quizzes
- AI explains wrong answers
- Quiz accuracy tracked per user
- Concept gaps updated after each quiz

### Search Bar
- Type subject/topic to see dropdown suggestions
- Click a result to navigate directly
- Clears after navigation

### Offline Mode
- Simulate offline with the toggle button
- Real network status shown in topbar (green = online, red = offline)
- Actual offline detection via navigator.onLine

### Bell Notifications
- Teachers can send messages to all students
- Students see messages in notification panel
- Unread count shown with red dot

### Logout
- 🚪 button in topbar to logout securely
