## Sweet Shop Management System (Backend - Node.js/MongoDB)

This repository contains the robust RESTful API that powers the Sweet Shop Management System. It is built using Node.js, Express, and MongoDB, with all core functionality developed under a strict Test-Driven Development (TDD) methodology.

## 1. Technical Scope and TDD Process

The backend serves as the authoritative source for all user and inventory data, secured via JWT. The commit history clearly demonstrates the Red-Green-Refactor pattern used to build each feature.

Implemented Endpoints

Authentication: POST /api/auth/register, POST /api/auth/login (Token Generation)

Sweets (Protected): POST /api/sweets (Add), GET /api/sweets (View All), GET /api/sweets/search (Search by params), PUT /api/sweets/:id (Update Details).

Inventory & Administration:

DELETE /api/sweets/:id (Admin Only)

POST /api/sweets/:id/purchase (Decrement stock for purchase)

POST /api/sweets/:id/restock (Admin Only)

## 2. Frontend Link (User Interface)

The client application built with React to consume this API and provide the User/Admin interfaces can be found here:

https://github.com/Prathik-007/sweet-shop-frontend

## 3. Setup and Run Instructions

Prerequisites

Node.js (v18+)

A MongoDB database connection string (MONGO_URI).

Backend Setup

Clone this repository.

Install dependencies: npm install

Create a .env file in the root directory and add your secret keys:

PORT=5000
MONGO_URI=<YOUR_MONGODB_CONNECTION_STRING>
JWT_SECRET=<YOUR_SECRET_KEY>


Run the API server: npm run server

## 4.  My AI Usage 

I utilized the Gemini as a critical co-author throughout the project. The AI was essential in setting up the TDD process, designing the API resource structure, and writing the code for all controllers, models, and middleware, ensuring the complex security and inventory logic was robustly implemented and tested.

For the complete detailed usage, testing results, and reflections on the front-end TDD, please refer to the Frontend README.
