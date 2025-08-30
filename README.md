# Service Spec Maker Backend

This is the backend for the Service Spec Maker application. It's built with Node.js, Express, TypeScript, and MongoDB.

## Features

- Receives marketing/spec form data via JSON
- Saves data to MongoDB Atlas via Mongoose
- Generates a unique slug for each spec
- Renders a public read-only page using EJS
- Provides a shareable public URL for each spec

## Tech Stack

- Node.js 18+
- Express 4+
- TypeScript
- MongoDB Atlas + Mongoose
- EJS + Tailwind CSS (via CDN) for templating
- Zod for validation
- Nanoid for slug generation

## Prerequisites

- Node.js 18 or higher
- MongoDB Atlas account (or local MongoDB instance)

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies

```bash
npm install
```

4. Create a `.env` file based on `.env.example` and fill in your MongoDB connection string and other environment variables

## Running Locally

### Development Mode

```bash
npm run dev
```

This will start the server with hot-reloading enabled.

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

- `POST /api/specs` - Create a new spec
- `GET /api/specs/:slug` - Get a spec by slug
- `GET /s/:slug` - View the spec page
- `GET /health` - Health check endpoint

## Example Usage

### Creating a new spec

```bash
curl -X POST http://localhost:5000/api/specs \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Acme Corporation",
    "brief": "Acme Corporation needs a new website to showcase their innovative products and services.",
    "services": [
      {
        "category": "Web Development",
        "items": ["Responsive Website", "Content Management System", "E-commerce Integration"]
      },
      {
        "category": "Design",
        "items": ["UI/UX Design", "Logo Redesign", "Brand Guidelines"]
      }
    ],
    "pricing": [
      {
        "title": "Basic Package",
        "price": 5000,
        "currency": "$",
        "features": ["Responsive Website", "Content Management System", "Basic SEO"]
      },
      {
        "title": "Premium Package",
        "price": 10000,
        "currency": "$",
        "features": ["Responsive Website", "Content Management System", "E-commerce Integration", "Advanced SEO", "Social Media Integration"]
      }
    ],
    "contact": {
      "email": "info@acme.com",
      "phone": "+1 (555) 123-4567",
      "website": "https://acme.com"
    },
    "meta": {
      "brandColors": ["#FF5733", "#33FF57", "#3357FF"],
      "logoUrl": "https://example.com/logo.png"
    }
  }'
```

Response:

```json
{
  "ok": true,
  "slug": "acme-corporation-abc123",
  "url": "http://localhost:5000/s/acme-corporation-abc123"
}
```

## Deployment

### Deploying to Railway

1. Create a new project on [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Add the required environment variables
4. Deploy the application

### Deploying to Render

1. Create a new Web Service on [Render](https://render.com/)
2. Connect your GitHub repository
3. Configure the build and start commands:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add the required environment variables
5. Deploy the application

## Environment Variables

- `PORT` - The port the server will run on (default: 5000)
- `BASE_URL` - The base URL of the application (e.g., https://your-app.railway.app)
- `MONGODB_URI` - MongoDB connection string