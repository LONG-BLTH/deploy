# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A basic Node.js/Express REST API project following an MVC architecture pattern. The application uses in-memory data storage (no database) and provides user management endpoints.

## Running the Application

```bash
# Install dependencies
npm install

# Start the server
node index.js
```

The server runs on port 3000 by default. Access the API at `http://localhost:3000`.

## Project Architecture

### Entry Point Flow
- `index.js` - Server entry point, imports app from `app.js` and starts Express server on port 3000
- `app.js` - Main application configuration, middleware setup, and route mounting

### MVC Structure
- **Routes** (`routes/`) - Define API endpoints and map them to controller methods
  - Routes are mounted in `app.js` using `app.use()`
- **Controllers** (`controllers/`) - Handle request/response logic and business operations
  - Controllers contain handler functions that are referenced in route files
- **Data** - Currently stored as in-memory arrays within controller files (no models layer yet)

### Current API Endpoints
- `GET /` - API welcome message with endpoint listing
- `GET /hello` - Test endpoint
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

## Code Conventions

- Controllers export individual handler functions (not classes)
- All API responses follow a consistent structure with `success`, `data`, and optional `count` or `message` fields
- Route definitions use Express Router and are modularized by resource type
- The main app instance is exported from `app.js` for separation of concerns (app logic vs server startup)
