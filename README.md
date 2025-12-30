# Fitness Tracker

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## How to Deploy (with GitHub Persistence)

This app uses **GitHub Issues** as a database. To deploy it and keep it working:

1.  **Fork this Repository**  
    Create your own copy of this repo on GitHub.

2.  **Generate a Personal Access Token**  
    - Go to GitHub -> Settings -> Developer Settings -> Personal Access Tokens (Classic).
    - Generate a new token with `repo` scope (full control of private repositories).
    - Copy the token.

3.  **Deploy on Vercel**  
    - Import your forked repository on Vercel.
    - Add the following **Environment Variables**:
      - `NEXT_PUBLIC_GITHUB_TOKEN`: The token you just copied.
      - `NEXT_PUBLIC_REPO_OWNER`: Your GitHub username.
      - `NEXT_PUBLIC_REPO_NAME`: The name of your repo (e.g., `fitness-tracker`).

4.  **Done!**  
    Vercel will build and deploy the site. All your workouts will be saved as Issues in your GitHub repository.

