# 📝 Full-Stack Task Manager Web Application

A secure, scalable, and fully responsive Task Manager Web Application developed as part of the Round 2 Evaluation Assignment. This full-stack application enables users to securely register, authenticate, and manage their personal tasks with complete CRUD functionality. It uses modern technologies including Spring Boot, React.js, PostgreSQL, and JWT-based authentication.

The application ensures secure user-specific task management with proper authentication, authorization, and database integration.

---

## 🚀 Key Features

### 🔐 Authentication & Security

- Secure User Registration
- User Login with JWT Authentication
- Password Encryption using BCrypt
- Stateless Authentication using JWT Tokens
- User-specific data access (Authorization protection)
- Protected REST API endpoints

### ✅ Task Management

- Create new tasks
- View all user-specific tasks
- Edit existing tasks
- Delete tasks
- Mark tasks as completed or pending
- Persistent storage in PostgreSQL database

### 🎨 User Interface

- Fully responsive design
- Clean and modern UI using Tailwind CSS
- Interactive dashboard
- Smooth user experience

---

## 🛠️ Tech Stack

### Backend

- Java 17+
- Spring Boot 3.x
- Spring Security
- JWT (JSON Web Token)
- Hibernate / JPA
- Maven

### Frontend

- React.js 18
- Tailwind CSS
- Lucide React Icons
- Fetch API

### Database

- PostgreSQL

---

## 📂 Project Structure

```
task-manager/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/               # Controllers, Models, Security, Repositories
│   ├── src/main/resources/
│   │   └── application.properties    # Database & App Configuration
│   └── pom.xml                       # Maven dependencies
├── frontend/                         # React Frontend
│   └── taskmanager-ui/
│       ├── src/
│       │   ├── App.js
│       │   ├── Dashboard.js
│       │   ├── Login.js
│       │   ├── Register.js
│       │   └── index.js
│       ├── public/
│       └── package.json
└── README.md
```

---

## ⚙️ Setup and Installation Guide

### Prerequisites

Make sure you have installed the following:

- Java JDK 17 or higher
- Node.js (v16 or higher)
- npm
- PostgreSQL
- Git

### Step 1: Database Setup

Open PostgreSQL terminal or pgAdmin and create database:

```sql
CREATE DATABASE task_manager;
```

Note: No need to create tables manually. Spring Boot will automatically create them.

### Step 2: Backend Setup

Navigate to backend directory:

```bash
cd backend
```

Open the configuration file:

```
src/main/resources/application.properties
```

Update database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/task_manager
spring.datasource.username=YOUR_POSTGRES_USERNAME
spring.datasource.password=YOUR_POSTGRES_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8080
```

Run backend application:

**Windows:**

```bash
mvnw.cmd spring-boot:run
```

**Mac/Linux:**

```bash
./mvnw spring-boot:run
```

Backend will start at: `http://localhost:8080`

### Step 3: Frontend Setup

Open a new terminal and navigate to frontend directory:

```bash
cd frontend/taskmanager-ui
```

Install dependencies:

```bash
npm install
```

Start frontend:

```bash
npm start
```

Frontend will run at: `http://localhost:3000`

---

## ▶️ How to Run the Application

1. Start PostgreSQL database
2. Run backend server
3. Run frontend server
4. Open browser and navigate to: `http://localhost:3000`
5. Register new account
6. Login with credentials
7. Create, edit, delete, and manage tasks

---

## 🔐 Authentication Flow

The application follows a secure JWT-based authentication flow:

1. User registers with email and password
2. User logs in with credentials
3. Server generates JWT token and sends to client
4. Token is stored in local storage
5. Token is sent with each request in Authorization header
6. Backend validates token on protected endpoints
7. User accesses protected resources only if token is valid
8. Token expires after set duration (typically 24 hours)

---

## 📝 API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Task Endpoints (Protected)

- `GET /api/tasks` - Get all tasks for logged-in user
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update existing task
- `DELETE /api/tasks/{id}` - Delete task

---

## 🎯 Features in Detail

### User Registration

Users can create a new account by providing:
- Email address
- Password (minimum 6 characters)
- Confirm password

Passwords are encrypted using BCrypt before storing in database.

### User Authentication

Login requires:
- Email address
- Password

Upon successful login, JWT token is generated and returned to client.

### Task Management

Users can:
- Create tasks with title and description
- View all their tasks in dashboard
- Edit task details
- Mark tasks as completed or pending
- Delete tasks permanently
- All tasks are user-specific and secure

---

## 🔒 Security Features

- Password hashing with BCrypt
- JWT token-based stateless authentication
- CORS configuration for secure cross-origin requests
- Protected endpoints with Spring Security
- User-specific data isolation
- SQL injection prevention with parameterized queries

---

## 📦 Dependencies

### Backend (Maven)

- Spring Boot Starter Web
- Spring Boot Starter Security
- Spring Boot Starter Data JPA
- Spring Boot Starter Validation
- PostgreSQL Driver
- JWT Library (jjwt)
- Lombok

### Frontend (npm)

- React 18
- Tailwind CSS
- Lucide React Icons
- React Router DOM

---

## 🐛 Troubleshooting

### Backend won't start

- Ensure PostgreSQL is running
- Check database credentials in `application.properties`
- Verify Java version is 17 or higher

### Frontend won't start

- Ensure Node.js is installed (v16 or higher)
- Delete `node_modules` folder and run `npm install` again
- Clear npm cache: `npm cache clean --force`

### Cannot connect to database

- Verify PostgreSQL service is running
- Check database name is `task_manager`
- Ensure username and password are correct
- Check if port 5432 is accessible

---

## 📄 License

This project is created as part of Round 2 Evaluation Assignment.

---

## 👨‍💻 Author

Developed as a full-stack web application project.

---

## 📧 Support

For issues or questions, please contact the development team.
