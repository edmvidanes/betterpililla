# Local containers

Requires Docker Engine with Linux containers and Docker Compose. On Windows, use Docker Desktop. Stop the Node preview if it already uses port 4174.

```sh
npm run container:up
npm run container:status
```

Open http://127.0.0.1:4174/. To stop only this project:

```sh
npm run container:down
```

The multistage Dockerfile builds static output with Node.js 24 and serves it using unprivileged Nginx. Compose binds only to loopback, uses a dedicated project network and limits resources. It requires no database, host mounts, production credentials or Docker socket inside the container.

Run `sh scripts/verify-container.sh` on Linux to inspect a running container's health, UID, filesystem, network, ports and resource restrictions. Change `BETTERPILILLA_PORT` in a local `.env` if 4174 is occupied. Never commit that file.

For machines with limited build capacity, `deploy/Dockerfile.runtime` accepts a previously built `dist/` directory. Build and review it with `npm run build` before creating that image. Deployment configuration should be adapted to the intended environment; private infrastructure details are not part of this repository.
