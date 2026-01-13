## App Context & Functionality

This is an Express.js backend application that provides decision analysis services. It processes user decisions through AI-powered cognitive analysis, generating insights about decision-making patterns, cognitive biases, and alternative perspectives. The application stores decision data and serves analysis results to the frontend.

The application is deployed with custom CI/CD on a DigitalOcean droplet and connects to a DigitalOcean database cluster (PostgreSQL 18). It utilizes Google Gemini AI for insight data generation.

The application consists of the following functionality:

### Auth

**`POST /auth/login/vendor`**

Authenticate and authorize users through a single route. Since authorization is only with Google, a single route handles the authentication flow.

**`POST /auth/token-verify`**

Token verification endpoint. When a user opens the app, the frontend sends a request to this endpoint to verify the JWT token. If the token is invalid, the user is logged out on the client side.

### Decision

All endpoints are protected with authentication middleware.

- **`GET /decisions`** - Returns all decisions for the authenticated user.
- **`POST /decisions`** - Creates a new decision and saves it to the database with a pending status that will be consumed by the cronjob.
- **`POST /decisions/:id/retry`** - Regenerates a specific decision with AI and returns the decision with updated insights data.
- **`POST /decisions/analyze`** - Endpoint for manually triggering analysis of pending decisions (for testing purposes).

### CronJob

The application has one cronjob `generateInsights` that runs every 30 seconds. It takes all pending decisions and sends them to Google Gemini AI for insight generation.

## Planned Functionality

Due to time constraints, the following functionality was not completed:

- Migrate from cronjob-based insight generation to a Lambda function that will be responsible for generating insights
- Add support for query parameters on `/decisions` endpoint to enable sorting on the frontend
- Implement `/metrics` endpoint for data visualization on the UI (all required data is already available)
- Configure monitoring system (e.g., Sentry)

## Running Project Locally

1. Spin up a local PostgreSQL database:

   ```bash
   docker run -d \
     --name postgres-local \
     -p 5432:5432 \
     -e POSTGRES_PASSWORD=postgres_test \
     -e POSTGRES_USER=admin \
     -e POSTGRES_DB=choose_smart \
     -v postgres-data:/var/lib/postgresql/data \
     postgres:18-alpine
   ```

2. Create a `.env` file based on `.env.example`
   - You can get `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GEMINI_API_KEY` from Google Cloud Console
3. Run database migrations:
   ```bash
   npm run db:generate && npm run db:migrate
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## Environments

### Production

- **Web**: [https://choosesm.art](https://choosesm.art)
- **Backend**: [https://api.choosesm.art](https://api.choosesm.art)
