# container_website

React + TypeScript (Vite) frontend for **easydevelop** — ephemeral, TTL-managed sandboxes provisioned through Railway's GraphQL API.

Deployed as its own Railway service in the `easydevelop_app` project (root directory = repo root, since this repo is frontend-only).

- `component/` — reusable UI components

Talks to the `server` repo's GraphQL API (see that repo for the API/provisioning/TTL-worker code).
