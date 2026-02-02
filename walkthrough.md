# Walkthrough - Chemical Equipment Parameter Visualizer

I have completed the development of the Chemical Equipment Parameter Visualizer. The system consists of a Django backend, a React web frontend, and a PyQt5 desktop application.

## Completed Features
- **Backend (Django):**
    - REST API for CSV upload (`/api/datasets/`) and statistics (`/api/datasets/{id}/stats/`).
    - History Limit: Keeps only the last 5 datasets.
    - PDF Generation: `/api/datasets/{id}/report/`.
    - Basic Authentication implemented.
- **Web Frontend (React):**
    - File Upload with progress indication.
    - Dashboard with Charts (Equipment Type Pie Chart, Flowrate vs Pressure Line Chart).
    - Data Table for raw values.
    - PDF Download.
- **Desktop Frontend (PyQt5):**
    - Native desktop UI with Login.
    - Matplotlib charts matching the web visualization.
    - Upload and History management.

## Verification Results
I performed a verification of the API using a script and confirmed:
- **Upload:** Successfully uploaded `sample_equipment_data.csv`.
- **Stats:** Correctly calculated Total Count (15) and Average Temperature (~117.47).
- **Listing:** History is tracked.

## How to Run

### 1. Backend
Currently running in background. To restart:
```bash
cd backend
..\venv\Scripts\python manage.py runserver
```
Admin Credentials: `admin` / `admin`

### 2. Web Frontend
Currently running in background. To restart:
```bash
cd web-frontend
npm run dev
```
Access at: [http://localhost:5173](http://localhost:5173)

### 3. Desktop Frontend
```bash
cd desktop-frontend
..\venv\Scripts\python main.py
```
Login with `admin` / `admin`.

## Project Structure
- `backend/`: Django Project (`core`, `api`).
- `web-frontend/`: Vite + React Project.
- `desktop-frontend/`: PyQt5 Application (`main.py`).
- `sample_equipment_data.csv`: Sample data for testing.
