# SEC Filing Events Tracker

A comprehensive application that monitors SEC EDGAR filings, extracts key events, and provides a calendar-based visualization for tracking corporate events like ticker changes, insider buying, share buybacks, and more.

## Features

- **Automated Filing Retrieval**: Daily checks for new SEC filings
- **Intelligent Event Extraction**: Parses filings to identify important corporate events
- **Calendar Visualization**: View upcoming events in an interactive calendar
- **Company-specific Views**: Track events for specific companies
- **Event Filtering**: Filter by event type, date range, and company
- **Watchlists**: Create and manage watchlists of companies
- **Email Alerts**: Get notified when new events are detected for your watched companies
- **Mobile-Responsive**: Works on desktop and mobile devices

## Events Tracked

The system monitors the following types of events from SEC filings:

1. **Name or Ticker Changes** (Form 8-K, Items 5.03, 8.01)
2. **Insider Buying** (Form 4)
3. **Large Institutional/Activist Investor Stakes** (Schedule 13D/G)
4. **Share Buybacks** (Form 8-K, 10-Q/K)
5. **Reverse Stock Splits** (Form 8-K, PRE/DEF 14A/C)
6. **Exchange Uplistings** (Form 8-K)
7. **FDA Approvals & Patents** (Form 8-K, 10-Q/K)
8. **Spin-offs & Special Dividends** (Form 8-K)
9. **Debt Reduction & Refinancing** (Form 8-K)

**Core Concepts**

**SEC Filing Parsing**
The application fetches SEC filings from the EDGAR API and parses them to extract relevant events using a modular parser system. Each parser specializes in a specific form type (8-K, 4, 13D, etc.) and extracts structured data.

**Event Extraction**
Events are extracted from parsed filings based on pattern matching and contextual analysis. The system identifies name changes, ticker changes, insider buying, and other significant corporate events.

**Database Management**
Events and company data are stored in a PostgreSQL database, with Prisma ORM providing type-safe access. In production, Supabase is used as the database provider.

**Authentication and Authorization**
The application uses JWT tokens for authentication, with middleware to protect API routes. Role-based access control ensures users can only access appropriate resources.

**Responsive UI**
The UI is built with React and TailwindCSS, with responsive components that work on both desktop and mobile devices. The design follows accessibility best practices (WCAG 2.1 AA).

## Architecture

![Architecture Diagram](https://via.placeholder.com/800x400?text=SEC+Tracker+Architecture)

The application follows a modern React/Next.js architecture with the following components:

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL via Prisma ORM (with Supabase in production)
- **Data Processing**: Custom SEC EDGAR API client and event extraction system
- **Authentication**: JWT-based auth system
- **Deployment**: Vercel

## Technologies

- **Backend**: Node.js, Express, Prisma ORM
- **Frontend**: Next.js, React, TailwindCSS
- **Database**: PostgreSQL
- **Hosting**: Vercel
- **Automation**: GitHub Actions
- **APIs**: SEC EDGAR API

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL or Supabase account
- Vercel account (for deployment)
- Git

### Local Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/sec-filing-events-tracker.git
cd sec-filing-events-tracker
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file based on `.env.example`
```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

4. Set up the database
```bash
npx prisma migrate dev
```

5. Run the development server
```bash
npm run dev
```

6. Build the company database (first time setup)
```bash
node scripts/build-company-db.js
```

7. Fetch initial filing data
```bash
node scripts/fetch-filings.js
```

### Production Deployment

1. Fork this repository to your GitHub account

2. Set up the following secrets in your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID
   - `DATABASE_URL`: Your PostgreSQL database URL
   - `SEC_API_EMAIL`: Email address for SEC API requests

3. Push to the main branch to trigger a deployment to Vercel

4. Configure a database in Vercel (or use an external PostgreSQL provider)

## Project Structure

```
sec-filing-events-tracker/
├── .github/               # GitHub Actions workflows
├── cypress/               # End-to-end tests
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React context providers
│   ├── lib/               # Core functionality
│   │   ├── analytics/     # Analytics tracking
│   │   ├── database/      # Database connections and queries
│   │   ├── edgar-api/     # SEC EDGAR API client
│   │   ├── events/        # Event extraction and processing
│   │   ├── hooks/         # Custom React hooks
│   │   ├── middleware/    # API middleware
│   │   ├── parsers/       # SEC filing parsers
│   │   └── utils/         # Utility functions
│   ├── pages/             # Next.js pages and API routes
│   └── styles/            # Global styles
├── tests/                 # Unit and integration tests
└── types/                 # TypeScript type definitions
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events/upcoming` | GET | Get upcoming events |
| `/api/companies/[identifier]/events` | GET | Get events for a specific company |
| `/api/companies/search` | GET | Search for companies by name or ticker |
| `/api/events/type/[type]` | GET | Get events by type |
| `/api/events/date-range` | GET | Get events within a date range |
| `/api/watchlists` | GET/POST | Get or create watchlists |
| `/api/watchlists/[id]/companies` | POST/DELETE | Add/remove companies from watchlist |
| `/api/alerts` | GET/POST | Get or create alerts |

## Secret Management

This project requires proper secret management. Follow these steps to securely set up your environment:

1. **Local Development**
   - Copy `.env.example` to `.env.local`
   - Generate strong random values for JWT_SECRET and CSRF_SECRET
   - Never commit `.env.local` to version control

2. **Vercel Deployment**
   - Add all environment variables in Vercel's dashboard
   - Use Vercel's integration with Supabase for automatic environment setup
   - Ensure production secrets are different from development

3. **Supabase Configuration**
   - Create a new Supabase project
   - Configure database policy permissions
   - Set up auth providers and domains
   - Generate and securely store API keys

4. **Secret Rotation**
   - Rotate JWT_SECRET and other sensitive secrets regularly
   - Update Vercel environment variables after rotation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [SEC EDGAR](https://www.sec.gov/edgar.shtml) for providing access to filing data
- [Next.js](https://nextjs.org/) for the React framework
- [Prisma](https://www.prisma.io/) for database ORM
- [TailwindCSS](https://tailwindcss.com/) for styling
- [React Big Calendar](https://github.com/jquense/react-big-calendar) for calendar views
