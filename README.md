# THREE-TIER MERN APPLICATION – Frontend

A React-based Student Management System frontend built with **React, Vite, and JavaScript**, deployed on **AWS EC2** using Nginx.

This project demonstrates frontend development, production builds, cloud deployment, and integration with a backend REST API.

# Backend: [student-backend](https://github.com/Student-aditya123/Three-Tier-MERN-Application-backend.git)

## 🚀 Features

- Responsive React-based user interface.
- Student data management through backend API integration.
- File upload interface.
- REST API communication with the backend.
- Production build using Vite.
- Deployment on AWS EC2.
- Nginx configuration for serving the frontend.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Build tool |
| JavaScript | Application logic |
| CSS | Styling |
| Nginx | Web server |
| AWS EC2 | Cloud deployment |
| Git & GitHub | Version control |

## 🏗️ Architecture

```text
              User / Browser
                    |
                    v
              AWS EC2 Instance
                    |
                    v
                  Nginx
                    |
                    v
             React Frontend
                    |
                    | HTTP Requests
                    v
              Backend REST API
```

## 📂 Project Structure

```text
student-frontend/
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

*The structure may vary depending on the final implementation.*

## ⚙️ Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/Student-aditya123/student-frontend.git
```

### 2. Navigate to the project

```bash
cd student-frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file if required by your application.

```env
VITE_API_URL=YOUR_BACKEND_API_URL
```

### 5. Start development server

```bash
npm run dev
```

### 6. Create production build

```bash
npm run build
```

The production-ready files will be generated inside the `dist/` directory.

## ☁️ AWS Deployment

The frontend is deployed on an AWS EC2 instance.

Deployment workflow:

1. Launch an EC2 instance.
2. Install Node.js and Nginx.
3. Clone the frontend repository.
4. Install project dependencies.
5. Generate the production build.
6. Configure Nginx to serve the generated `dist/` directory.
7. Configure the required network access through the EC2 Security Group.

## 🔗 Related Repository

**Backend:** [student-backend](https://github.com/Student-aditya123/Three-Tier-MERN-Application-backend.git)

## 🎯 Learning Outcomes

- React application development.
- Production builds using Vite.
- AWS EC2 deployment.
- Nginx web server configuration.
- Frontend and backend integration.
- Basic cloud infrastructure management.

## 👨‍💻 Author

**Aditya Singh**

B.Tech Computer Science & Engineering

[GitHub](https://github.com/Student-aditya123) | [LinkedIn](YOUR_LINKEDIN_URL)

---

⭐ If you find this project useful, consider giving it a star!
