# Notebook App Example

This example demonstrates the integration between Express.js and the `@cedar-policy/authorization-for-expressjs` module. It consists of a React frontend and an Express.js backend that implements Cedar authorization for notebook management.

## Prerequisites

Before running the application, you need:

1. Node.js installed on your system
2. An AWS account with:
   - A Cognito User Pool
   - A Verified Permissions Policy Store

## Configuration

The following environment variables are required:

```bash
AWS_REGION=<your-aws-region>           # The AWS region where your resources are located
USERPOOL_ID=<your-userpool-id>         # The ID of your Cognito User Pool
POLICY_STORE_ID=<your-policy-store-id> # The ID of your Verified Permissions Policy Store
```

## Running the Application

### Backend

1. Navigate to the backend directory:
   ```bash
   cd notebook-app-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The backend will run on http://localhost:3000

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd notebook-app-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure the `VITE_USERPOOL_ID` env var is set with an appropriate value matching the backend.

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on http://localhost:5173

## Application Structure

- `notebook-app-backend/`: Express.js server with Cedar authorization integration
  - `middleware/`: Contains authentication middleware
  - `policies/`: Cedar policy files
  - `index.js`: Main server file
  - `notebookRepository.js`: Notebook data management

- `notebook-app-frontend/`: React/TypeScript frontend application
  - `src/`: Source code directory
    - `components/`: Reusable React components
    - `routes/`: Application routes
    - `state/`: Application state management

## Features

- User authentication via AWS Cognito
- Authorization using Cedar policies
- Create, read, update, and delete notebooks
- Share notebooks with other users
- Policy-based access control

## API Endpoints

- `GET /notebooks`: List all notebooks owned by the authenticated user
- `POST /notebooks`: Create a new notebook
- `GET /notebooks/:id`: Get a specific notebook
- `PUT /notebooks/:id`: Update a notebook
- `DELETE /notebooks/:id`: Delete a notebook
- `GET /notebooks/shared-with-me`: List notebooks shared with the authenticated user
