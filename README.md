# Shipments Service Failed Messages Monitoring

## Table of Contents

- [Overview](#overview)

- [Getting Started](#getting-started)

- [Prerequisites](#prerequisites)

- [Installation](#installation)

- [Database Setup](#database-setup)

- [Running the Project](#running-the-project)

## Overview

Shipments Service failed messages monitoring service

## Getting Started

These instructions will help you set up and run the Failed Message Monitoring service on your local machine or server.

### Prerequisites

Ensure you have Docker installed on your system. For installation instructions, please refer to the [official Docker documentation](https://docs.docker.com/get-docker/).

### Installation

To install this project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://gitlab.fbr.group/academic-teaching/academic-teaching-failed-messages-monitoring.git
   ```

2. Navigate into the project directory:
   ```bash
   cd academic-teaching-failed-messages-monitoring
   ```

3. Create a `.env` file in the root of the project by copying the example file and update it with your configuration settings:
   ```sh
   cp .env.example .env
   ```

4. Build the Docker image and run Docker services with Docker Compose:
   ```sh
   docker compose up
   ```

5. Enter the backend container:
      ```sh
      docker compose exec backend sh
      ```

6. Install dependencies:
   ```sh
   npm ci
   ```

### Database Setup

Below are the steps to set up the database along with the corresponding commands:

1. Create the Database (if not already created by Docker Compose):
   ```bash
   npm run db:create
   ```

2. Drop and Recreate Database (if needed):
   ```bash
   npm run db:drop
   ```

3. Run Migrations:
   ```bash
   npm run up
   ```

4. Rollback Migrations (if needed):
   - To rollback the last migration:
     ```bash
     npm run undo
     ```
   - To rollback all migrations:
     ```bash
     npm run undo:all
     ```

5. Seed the Database:
   ```bash
   npm run seed
   ```

6. Undo Seeding Operations (if needed):
   - If needed, you can undo the last seeding operation:
     ```bash
     npm run seed:undo
     ```
   - If needed, you can undo all seeding operations:
     ```bash
     npm run seed:undo:all
     ```

### Running the Project

1. Start the HTTP API server in development mode:
   ```bash
   npm run start
   ```

2. Replay messages:
   - If want to replay message with a limit (default value is 50) 
      ```bash
      npm run replay-messages -- --limit 50
      ```

   - If want to replay a particular message with poison_message_id (if limit is also provided it will be overlooked)
      ```bash
      npm run replay-messages -- --poison-message-id 3fa85f64-5717-4562-b3fc-2c963f66afa6
      ```
   - To learn how to use the `replay-messages` command, you can run the following in your terminal:
      ```bash
      npm run replay-messages -- --help
      ```

3. Handle messages:
   - If want to handle message with a limit (default value is 10) 
      ```bash
      npm run handle-messages -- --limit 5
      ```

   - To learn how to use the `handle-messages` command, you can run the following in your terminal:
      ```bash
      npm run handle-messages -- --help
      ```

The application should now be running at `http://localhost:8000`.