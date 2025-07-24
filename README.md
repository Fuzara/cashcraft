# CashCraft

![Deploy to ICP](https://github.com/Fuzara/cashcraft/actions/workflows/deploy.yml/badge.svg)

---

## Overview
CashCraft is a production-grade Internet Computer + Next.js project with automated canister deployments and Vercel frontend hosting.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Requirements

Make sure you have the following tools installed:
- [dfx](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
- [Node.js](https://nodejs.org/)
- [jq](https://stedolan.github.io/jq/download/)

### Running the Local Development Environment

To get everything running locally, from the root of the project, run the following command:

```bash
# Make the script executable (only needs to be done once)
chmod +x full_sync_and_run.sh

# Run the local development server
npm run start:local
```

This single command will:
1.  Start a clean, local replica.
2.  Deploy all canisters.
3.  Generate canister type definitions.
4.  Set up the necessary environment variables for the frontend.
5.  Install all dependencies.
6.  Start the Next.js development server.

### Deploying to Mainnet (IC)

To deploy your canisters to the IC mainnet, run the following command:

```bash
dfx deploy --network ic
```

After deploying, you will need to configure your frontend to use the mainnet canister IDs, which can be found in `.dfx/ic/canister_ids.json`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
