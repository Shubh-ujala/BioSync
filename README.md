# BioPulse - Advanced Healthcare Monitoring System

BioPulse is a real-time healthcare monitoring application designed to bridge the gap between patients and medical professionals. It leverages the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO to provide live vital sign updates and instant emergency alerts.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Key Features

*   **Real-Time Monitoring**: Live visualization of patient vitals (Heart Rate, Blood Pressure, SpO2) using Socket.IO.
*   **Role-Based Access Control**: Distinct dashboards for Patients, Doctors, and Admin.
    *   **Patients**: View personal health trends, simulate device data, and trigger SOS alerts.
    *   **Doctors**: Monitor assigned patients in real-time, view emergency alerts with patient details and contact info.
    *   **Admins**: Manage doctor approvals, view system statistics, and oversee critical alerts.
*   **Emergency SOS System**: Instant broadcasting of "Critical Condition" alerts to all connected doctors.
*   **Doctor Verification**: Secure registration process requiring document upload for admin verification.
*   **Modern UI/UX**: Responsive "Glassmorphism" design using Tailwind CSS for a premium medical interface.

## 🛠️ Technology Stack

*   **Frontend**: React.js, Vite, Tailwind CSS, Lucide React (Icons), Socket.IO Client.
*   **Backend**: Node.js, Express.js, Socket.IO (WebSockets), Multer (File Uploads).
*   **Database**: MongoDB (Mongoose ODM).
*   **Authentication**: JSON Web Tokens (JWT), Bcrypt.js.

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v14+)
*   MongoDB (Local or Atlas URI)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd entropic-shepard
```

### 2. Backend Setup
 Navigate to the backend directory and install dependencies.
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/healthcare_system
JWT_SECRET=your_jwt_secret_key_here
```

Start the backend server:
```bash
npm start
# OR for development with nodemon
npm run dev
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory.
```bash
cd frontend
npm install
```

Start the React development server:
```bash
npm run dev
```

Visit `http://localhost:5173` (or the port shown in your terminal) to view the application.

## 📖 Usage Guide

1.  **Patient Flow**: Register a new account. You will land on the Patient Dashboard where vitals are simulated. Click "Sync Device" to broadcast data. Use the "SOS" button for emergencies.
2.  **Doctor Flow**: Register as a doctor (requires file upload). Login is restricted until approved by an Admin. Once verified, log in to view active patients.
3.  **Admin Flow**: Login with admin credentials. Approve pending doctor requests and monitor system health.

## 🤝 Contributing
Contributions are welcome. Please open an issue or submit a pull request.

---
*Built for the Future of Telemedicine*
