# AI-Augmented ATP (Adaptive Teaching Platform)

AI-Augmented ATP is a full-stack educational platform designed to enhance the learning experience through AI-driven insights and real-time interaction. It provides teachers with tools to manage study materials (Decks) and facilitate real-time engagement (Clusters), while students benefit from an adaptive and interactive learning environment.

## 🚀 Project Overview

The platform is split into a robust Django-based backend and a modern React-based frontend.

- **Backend:** Django REST Framework, Django Channels (WebSockets), PostgreSQL, and JWT Authentication.
- **Frontend:** React, Vite, React Router, and Axios.

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 5.1
- **API:** Django REST Framework (DRF)
- **Real-time:** Django Channels
- **Authentication:** SimpleJWT
- **Database:** PostgreSQL (Development uses SQLite/PostgreSQL depending on `.env`)
- **Environment:** Python 3.13/3.14

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router 7
- **HTTP Client:** Axios

## 📂 Project Structure

```text
AI_Augmented_ATP/
├── backend/            # Django Project
│   ├── accounts/       # User management & Authentication
│   ├── classdecks/     # Study materials, Decks, and Modules
│   ├── clusters/       # Real-time interaction & WebSockets
│   ├── media/          # Uploaded files (PDFs, PPTXs)
│   └── manage.py
├── frontend/           # React Project
│   ├── src/
│   │   ├── api.js      # API configuration
│   │   ├── layouts/    # Student/Teacher layouts
│   │   └── pages/      # Application views
│   └── package.json
└── venv/               # Python Virtual Environment
```

## ⚙️ Getting Started

### Prerequisites
- Python 3.13+
- Node.js (v18+)
- PostgreSQL (optional, defaults to SQLite if configured)

### Backend Setup
1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```
2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies:**
   *(Ensure you have a requirements.txt, or install manually)*
   ```bash
   pip install django djangorestframework django-cors-headers django-dotenv djangorestframework-simplejwt channels[daphne]
   ```
4. **Environment Variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   DEBUG=True
   SECRET_KEY=your_secret_key
   DB_NAME=your_db
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   ```
5. **Run Migrations:**
   ```bash
   python manage.py migrate
   ```
6. **Start the server:**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🌟 Key Features
- **Real-time Clusters:** Interactive sessions between teachers and students using WebSockets.
- **Dynamic Decks:** Manage study modules with support for PDF and PPTX file conversions.
- **JWT Auth:** Secure authentication with access and refresh tokens.
- **Role-based Access:** Dedicated dashboards and layouts for Students and Teachers.

## 📄 License
This project is licensed under the MIT License.
