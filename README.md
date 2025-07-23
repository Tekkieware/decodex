# DeCodeX Frontend

DeCodeX is an **AI-powered code analysis tool** that helps developers understand, debug, and optimize their code quickly and efficiently.  
This is the **frontend** of the project, built using **Next.js, TypeScript, and Redux Toolkit**.

The backend for this project can be found here:  
➡️ [DeCodeX Backend Repository](https://github.com/Tekkieware/decodex-backend)

---

## Features

- **Automatic Language Detection**  
  Automatically identifies programming languages like JavaScript, Python, PHP, Rust, Java, and more.

- **Code Explanations in Simple Terms**  
  Explains code logic, functions, and variables clearly so developers at any level can understand.

- **Bug Detection and Optimization**  
  Detects errors and suggests ways to fix and improve your code.

- **Interactive AI Q&A**  
  Ask specific questions about your code and get instant, tailored insights.

- **Fast, Responsive, and Private**  
  Works smoothly across devices and keeps all your code private.

---

## Tech Stack

- [Next.js](https://nextjs.org/) – React-based framework for building scalable web apps.  
- [TypeScript](https://www.typescriptlang.org/) – Type-safe JavaScript for maintainability.  
- [Redux Toolkit](https://redux-toolkit.js.org/) – Simplified state management.  

---

## Getting Started

Follow these steps to **set up, run, and build** the project.

### 1. Prerequisites

Ensure you have these installed:

- [Node.js](https://nodejs.org/) (version 18 or later)
- npm (comes with Node.js) or [Yarn](https://yarnpkg.com/)

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone the frontend repository
git clone https://github.com/Tekkieware/decodex-frontend.git
cd decodex-frontend

# Install dependencies
npm install
# or
yarn install
```
### 3. Environment Variables

Create a .env.local file in the root directory and add the backend URL:

```bash
NEXT_PUBLIC_BACKEND_URL=<your-backend-url>

```

### 4. Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```
Now open http://localhost:3000 in your browser.

