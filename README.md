# Dev Journey

A comprehensive platform for developers to manage their career growth and job applications.

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (default: `http://localhost:8080`)

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   Create a `.env` file in the root directory with the following variables:
   ```env
   REACT_APP_API_URL=http://localhost:8080
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
   ```
   
   **Note**: Replace `your-google-client-id-here` with your actual Google OAuth Client ID. You can get one from the [Google Cloud Console](https://console.cloud.google.com/).

3. **Start the development server**:
   ```bash
   npm start
   ```
   
   The app will open at [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner

## Deployment

This project is configured for Vercel deployment.

### Deploying to Vercel

1. **Install Vercel CLI** (optional, for local deployment):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Push your code to GitHub/GitLab/Bitbucket
   - Import your repository in [Vercel Dashboard](https://vercel.com)
   - Vercel will automatically detect the Create React App framework
   - Add your environment variables in the Vercel dashboard:
     - `REACT_APP_API_URL` - Your backend API URL
     - `REACT_APP_GOOGLE_CLIENT_ID` - Your Google OAuth client ID

3. **Deploy via CLI**:
   ```bash
   vercel
   ```

### Environment Variables

Make sure to set the following environment variables in your Vercel project settings:

- `REACT_APP_API_URL` - Backend API base URL (e.g., `http://localhost:8080` for local, or your production API URL)
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth client ID

The configuration file `vercel.json` is already set up for optimal deployment.