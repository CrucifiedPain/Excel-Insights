# Deployment Guide

This guide provides instructions on how to deploy **Excel Insight** locally and on Vercel.

---

## I. Local Deployment

To run this application on your local machine, follow these steps:

### 1. Prerequisites
- **Node.js**: Ensure you have Node.js (v18 or later) installed.
- **npm**: npm is usually installed with Node.js.

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd excel-insight
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env.local` file in the root directory and add any necessary environment variables. For this app, the basic setup is:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 6. Build for Production
To test the production build locally:
```bash
npm run build
npm run start
```

---

## II. Deployment on Vercel

Vercel is the recommended platform for deploying Next.js applications.

### 1. Push to GitHub/GitLab/Bitbucket
Ensure your code is pushed to a remote Git repository.

### 2. Connect to Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **"New Project"**.
3. Import your repository.

### 3. Configure Project
- **Framework Preset**: Next.js (automatically detected).
- **Root Directory**: `./` (default).
- **Build Command**: `npm run build` (default).
- **Output Directory**: `.next` (default).

### 4. Add Environment Variables
In the Vercel project settings, add the following environment variables:
- `NEXT_PUBLIC_GEMINI_API_KEY`: Your Gemini API key.

### 5. Deploy
Click **"Deploy"**. Vercel will build and host your application, providing you with a production URL.

### 6. Automatic Deploys
Once connected, every push to your `main` branch will automatically trigger a new deployment.
