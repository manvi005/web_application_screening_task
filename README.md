# Chemical Equipment Parameter Visualizer

A full-stack hybrid application to visualize and analyze chemical equipment parameters (Flowrate, Pressure, Temperature). This project consists of a Django Backend, a React Web Frontend, and a PyQt5 Desktop Frontend.

## 🚀 Features

*   **Hybrid Architecture:** Single Django backend serving both Web (React) and Desktop (PyQt5) clients.
*   **Data Analysis:** Upload CSV datasets to calculate average parameters and equipment type distribution.
*   **Interactive Visualizations:**
    *   **Web:** Animated charts using Chart.js, glassmorphism UI design.
    *   **Desktop:** Native Matplotlib charts integrated into a PyQt5 window.
*   **History Management:** Automatically retains only the last 5 uploaded datasets.
*   **Reporting:** Generate professional PDF reports of the data analysis.
*   **Secure:** Custom Basic Authentication system.

## 🛠️ Technology Stack

*   **Backend:** Python, Django, Django REST Framework, Pandas, SQLite.
*   **Web Frontend:** React.js, Vite, TailwindCSS, Framer Motion, Chart.js.
*   **Desktop Frontend:** Python, PyQt5, Matplotlib, Requests.

## 📦 Prerequisites

*   Python 3.8+
*   Node.js 16+
*   npm

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/manvi005/web_application_screening_task.git
cd web_application_screening_task
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
..\venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser # Create admin credentials
```
*Note: The project is configured to use a common virtual environment in the root, but individual venvs work too.*

### 3. Web Frontend Setup
```bash
cd web-frontend
npm install
```

### 4. Desktop Frontend Setup
```bash
cd desktop-frontend
pip install -r requirements.txt
```

## ▶️ Running the Application

You need to run the Backend and Frontend (Web or Desktop) simultaneously.

### Step 1: Start Backend
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```
*API will run at http://localhost:8000*

### Step 2: Start Web Application
```bash
cd web-frontend
npm run dev
```
*Access the Web App at http://localhost:5173*

### Step 3: Run Desktop Application
```bash
cd desktop-frontend
python main.py
```

## 🔑 Authentication
Default credentials (if created via `createsuperuser`):
*   **Username:** `admin`
*   **Password:** `admin`

## 📁 Project Structure
```
root/
├── backend/            # Django Project (API & Core logic)
├── web-frontend/       # React + Vite Web Application
├── desktop-frontend/   # PyQt5 Desktop Application
├── sample_data.csv     # Sample file for testing
└── README.md
```
