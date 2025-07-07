# Guidelines for Contributors

This repository hosts **DebateMinistrator**, a full-stack application for debate tournament management.  The project uses a React + TypeScript frontend and an Express backend written in TypeScript.

## Basics
- Ensure you are using **Node.js 18 or later**.
- Install dependencies once with `npm install`.

## Running the Development Servers
- `npm run dev` – starts the Vite dev server for the frontend.
- `npm run server` – *removed*. The project no longer includes a separate API server.

## Testing
- Execute the entire test suite with:

  ```bash
  npm test --silent
  ```

- Tests are located under `src/**/__tests__`.
- If tests complain about missing environment variables, create an empty `.env` file. Local storage is used for persistence during development.

## Linting
- Run `npm run lint` before committing.  Lint errors will cause CI failures.

## Building for Production
- `npm run build` – creates a production build of the frontend.

## Typical Issues
- If the dev server fails after dependency updates, remove `node_modules` and run `npm install` again.
- Ensure any custom environment variables in `.env` match those expected by the frontend (`VITE_API_BASE_URL`, etc.).

## Pull Requests
- Make small, clear commits with descriptive messages.
- Always verify that `npm run lint` and `npm test --silent` succeed before opening a PR.

## Repository Layout
- `src/` – React components and utilities.
- `server/` – **removed**. Pairing logic now lives client side.
- `ROADMAP.md` – Long term development plan.

Consult `README.md` for a complete overview of project goals and setup instructions.
