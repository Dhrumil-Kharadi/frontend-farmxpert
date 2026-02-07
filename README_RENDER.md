# FarmXpert Frontend - Render Deployment

This folder contains the React frontend application configured for Render deployment.

## Quick Start for Render

1. **Repository Setup**
   ```bash
   git init
   git add .
   git commit -m "Initial frontend setup for Render"
   git remote add origin https://github.com/yourusername/farmxpert-frontend.git
   git push -u origin main
   ```

2. **Render Configuration**
   - Connect this repository to Render Static Site
   - Build Command: `npm run build`
   - Publish Directory: `build`

3. **Required Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-service.onrender.com
   NODE_ENV=production
   REACT_APP_ENV=production
   ```

## Key Files

- `render.yaml` - Render service configuration
- `package.json` - Node.js dependencies and scripts
- `public/` - Static assets
- `src/` - React application source code

## Configuration Notes

The frontend is configured to connect to the backend via the `REACT_APP_API_URL` environment variable. Make sure this points to your deployed backend service.

## Build Process

Render will automatically:
1. Install dependencies with `npm install`
2. Build the application with `npm run build`
3. Serve the static files from the `build` directory

## Deployment

Once deployed, your frontend will be available at:
`https://your-service-name.onrender.com`
