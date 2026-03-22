# Rubik's Cube Solver 🧩

A full-stack TypeScript application featuring a 3D Rubik's Cube solver. Built with React, Three.js (Fiber/Drei), Express, and Drizzle ORM.

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### 1. Prerequisites
* **Node.js**: Version 20.x or higher (Tested on v24)
* **PostgreSQL**: A running instance (or a [Neon.tech](https://neon.tech) connection string)
* **npm**: Installed with Node.js

### 2. Installation
Clone the repository and install the dependencies:
```bash
npm install
````

### 3\. Environment Setup

Create a `.env` file in the root directory and add your database connection string:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
PORT=5001
```

*Note: We use port **5001** by default to avoid conflicts with macOS AirPlay services.*

### 4\. Database Initialization

Push the database schema to your PostgreSQL instance using Drizzle:

```bash
npm run db:push
```

### 5\. Running the App

Start the development server (runs both backend and frontend):

```bash
npm run dev
```

The application will be available at [http://localhost:5001](https://www.google.com/search?q=http://localhost:5001).

-----

## 🛠 Tech Stack

  * **Frontend**: React, Vite, TailwindCSS, Framer Motion
  * **3D Rendering**: Three.js, @react-three/fiber
  * **Backend**: Express.js (Node.js)
  * **Database**: PostgreSQL with Drizzle ORM
  * **Validation**: Zod

## 📂 Project Structure

  * `/client` - React frontend and 3D components
  * `/server` - Express API and database configuration
  * `/shared` - Shared TypeScript types and Zod schemas

<!-- end list -->

```

---

