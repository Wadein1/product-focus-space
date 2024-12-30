# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/933f901e-311f-44b0-99c8-7121fd2a08cb

## Deployment to cPanel Instructions

1. Clone and build the project locally:
```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Create production build
npm run build
```

2. Upload to cPanel:
- Log in to your cPanel account
- Navigate to File Manager
- Go to your website's public directory (usually public_html)
- Upload all contents from the local 'dist' folder to this directory
- Make sure the .htaccess file is included in the upload

3. Configure domain:
- Point your domain to the directory where you uploaded the files
- Ensure SSL is properly configured if using HTTPS

Note: If you encounter any issues with routing, verify that the .htaccess file was properly uploaded and that mod_rewrite is enabled on your server.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/933f901e-311f-44b0-99c8-7121fd2a08cb) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
