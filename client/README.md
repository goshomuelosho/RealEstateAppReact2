# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Socket.IO Production Setup

- Use `VITE_SOCKET_URL` for the backend base URL (do not use `localhost` in production).
- Optional: use `VITE_SOCKET_PATH` if your reverse proxy exposes Socket.IO on a non-default path.
- Example env files:
- `client/.env.development.example`
- `client/.env.production.example`

If `VITE_SOCKET_URL` is not set:
- In development, the app falls back to `http://localhost:5000`.
- In production, the app falls back to `window.location.origin`.
