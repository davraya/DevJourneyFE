# Dev Journey

A comprehensive platform for developers to manage their career growth and job applications.

## Local Development

Use start script to run locally:

```bash
npm run start 
```

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