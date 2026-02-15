# 📝 Full-Stack Task Manager Web Application

A secure, scalable, and fully responsive Task Manager Web Application developed as part of the Round 2 Evaluation Assignment. This full-stack application enables users to securely register, authenticate, and manage their personal tasks with complete CRUD functionality. It uses modern technologies including Spring Boot, React.js, PostgreSQL, and JWT-based authentication.

The application ensures secure user-specific task management with proper authentication, authorization, and database integration.

---

# 🚀 Key Features

## 🔐 Authentication & Security

- Secure User Registration
- User Login with JWT Authentication
- Password Encryption using BCrypt
- Stateless Authentication using JWT Tokens
- User-specific data access (Authorization protection)
- Protected REST API endpoints

---

## ✅ Task Management

- Create new tasks
- View all user-specific tasks
- Edit existing tasks
- Delete tasks
- Mark tasks as completed or pending
- Persistent storage in PostgreSQL database

---

## 🎨 User Interface

- Fully responsive design
- Clean and modern UI using Tailwind CSS
- Interactive dashboard
- Smooth user experience

---

# 🛠️ Tech Stack

## Backend

- Java 17+
- Spring Boot 3.x
- Spring Security
- JWT (JSON Web Token)
- Hibernate / JPA
- Maven

## Frontend

- React.js 18
- Tailwind CSS
- Lucide React Icons
- Fetch API

## Database

- PostgreSQL

---

# 📂 Project Structure

task-manager/
│
├── backend/ # Spring Boot Backend
│ ├── src/main/java/ # Controllers, Models, Security, Repositories
│ ├── src/main/resources/
│ │ └── application.properties # Database & App Configuration
│ └── pom.xml # Maven dependencies
│
├── frontend/
│ └── taskmanager-ui/ # React Frontend
│ ├── src/
│ │ ├── App.js
│ │ ├── Dashboard.js
│ │ ├── Login.js
│ │ ├── Register.js
│ │ └── index.js
│ ├── public/
│ └── package.json
│
└── README.md


---

# ⚙️ Setup and Installation Guide

## Prerequisites

Make sure you have installed:

- Java JDK 17 or higher
- Node.js (v16 or higher)
- npm
- PostgreSQL
- Git

---

# Step 1: Database Setup

Open PostgreSQL terminal or pgAdmin and create database:

```sql
CREATE DATABASE task_manager;
No need to create tables manually. Spring Boot will automatically create them.

Step 2: Backend Setup
Navigate to backend directory:

cd backend
Open file:

src/main/resources/application.properties
Update database credentials:

spring.datasource.url=jdbc:postgresql://localhost:5432/task_manager
spring.datasource.username=YOUR_POSTGRES_USERNAME
spring.datasource.password=YOUR_POSTGRES_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8080
Run backend application:

Windows
mvnw.cmd spring-boot:run
Mac/Linux
./mvnw spring-boot:run
Backend will start at:

http://localhost:8080
Step 3: Frontend Setup
Open new terminal.

Navigate to frontend directory:

cd frontend/taskmanager-ui
Install dependencies:

npm install
Start frontend:

npm start
Frontend will run at:

http://localhost:3000
▶️ How to Run the Application
Start PostgreSQL database

Run backend server

Run frontend server

Open browser:

http://localhost:3000
Register new account

Login

Create, edit, delete, and manage tasks

🔐 Authentication Flow
User registers

User logs in

Server generates JWT token

Token sent with each request

Backend validates token

User accesses protected endpoint
