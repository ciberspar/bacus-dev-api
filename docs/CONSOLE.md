# Bacus Console

Developer control panel for Bacus Dev.

## Version

0.1-RC1.2

## Frontend

- HTML
- CSS
- JavaScript
- GitHub Pages compatible

## Developer tools

- API Playground
- JSON Studio
- API Designer
- Log Explorer
- Webhook Lab
- Data Explorer
- Bacus Network Inspector
- Bacus Memory Monitor
- Bacus Config Studio

## Current functionality

- Local JSON formatting and validation.
- JSON comparison.
- OpenAPI specification generation.
- HTTP API requests.
- Webhook test requests.
- Local JSON inspection.
- API health checks.
- Network latency measurement.
- Process memory metrics.
- JSON configuration editing and export.

## Backend requirements

The following endpoints are expected from the initial API:

- GET /
- GET /health
- GET /api/v1/info
- GET /api/v1/metrics

Additional endpoints still need backend implementation:

- GET /api/v1/logs
- Data storage and collection endpoints
- Authentication and user management
- Project management
- API key management

## Security

- Do not put private API keys in frontend source code.
- Do not store webhook secrets in browser storage.
- Do not expose administrative endpoints without authentication.
- Validate all input on the server.
- Use HTTPS for public deployments.

## Hosting

Publish the main branch using the /docs directory.

GitHub Pages hosts the frontend only.
Bacus Dev API must run separately.