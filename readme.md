# Rubik's Cube Solver 🧩

A full-stack TypeScript application featuring a 3D Rubik's Cube solver. Built with React, Three.js (Fiber/Drei), Express, and Drizzle ORM.

## 🚀 Getting Started

Follow these exact steps to set up the project on your local machine.

### 1. Prerequisites
* **Node.js**: v20.x or higher (Tested on v24)
* **npm**: Comes with Node.js
* **A Neon Account**: Sign up for free at [Neon.tech](https://neon.tech)

### 2. Installation
Clone this repository and install the required dependencies:
```bash
npm install
3. Database Setup (via Neon.tech)
This project requires a PostgreSQL database to store app data.

Log in to Neon.tech and create a new project (e.g., "RubiksCube").

On your Project Dashboard, look for the Connection String section.

Select Node.js from the dropdown and click the eye icon to show your password.

Copy the entire string (it starts with postgresql://).

4. Environment Configuration
In the root of this project, create a file named .env.

Paste your connection string into the file exactly like this:

Code snippet
DATABASE_URL=paste_your_neon_connection_string_here
PORT=5001
(Note: We use port 5001 to avoid conflicts with macOS AirPlay services on port 5000).

5. Initialize the Database
Before running the app, you must create the necessary tables in your Neon database:

Bash
npm run db:push
You should see a "Changes applied" message in your terminal.

6. Run the Application
Start the development server:

Bash
npm run dev
Once started, open your browser to: http://localhost:5001

🛠 Tech Stack
Frontend: React, Vite, TailwindCSS, Framer Motion

3D Engine: Three.js (@react-three/fiber & @react-three/drei)

Backend: Express.js (Node.js)

ORM: Drizzle ORM (PostgreSQL)

📂 Project Structure
/client - React frontend and 3D cube logic

/server - Express API, Authentication, and DB connection

/shared - TypeScript schemas used by both client and server