# How to install and run the project

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Docker Desktop](https://docs.docker.com/get-started/get-docker/)

---

## Run with Docker (recommended)

1. Install [Docker Desktop](https://docs.docker.com/get-started/get-docker/)
2. Start Docker Desktop
3. Open a terminal at the root of the project
4. Run the following command:

```bash
   docker compose up --build
```

5. Wait for the build to finish — you should see a line like:
   `Local: http://localhost:5173`
6. Open that link in your browser

> **Note:** The `--build` flag forces Docker to rebuild the image. You can omit it on subsequent runs if you haven't changed any files: `docker compose up` (or `docker compose up -d` if you want to continue to have access to the terminal, and then open manually the localhost link)

To stop the project, press `Ctrl+C` in the terminal (unless you added the -d flag at the end of the command), then run:

```bash
docker compose down
```

---

## Run without Docker (Vite only)

If you don't want to use Docker, you can run the project directly with Node.js and Vite.

1. Install [Node.js](https://nodejs.org/) (version 18 or higher)
2. Open a terminal at the root of the project
3. Install the dependencies:

```bash
   npm install
```

4. Start the development server:

```bash
   npm run dev
```

5. Open the link shown in the terminal (usually `http://localhost:5173`)

> **Note:** The `docker-compose.yml` and `Dockerfile` files can be ignored when running without Docker — Vite handles everything locally.
