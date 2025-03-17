# SEC Filing Events Tracker2

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

## Architecture

![Architecture Diagram](https://via.placeholder.com/800x400?text=SEC+Tracker+Architecture)

The application follows a modular architecture:

- **Data Collection**: Fetches and caches filings from SEC EDGAR API
- **Data Processing**: Parses filings and extracts relevant events
- **Database**: Stores structured event and company data
- **API**: RESTful endpoints for data access
- **Frontend**: Next.js web application with React components
- **Automation**: GitHub Actions for daily data collection

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
- PostgreSQL database
- GitHub account (for automation)
- Vercel account (for deployment)

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
├── .github/               # GitHub Actions configuration
├── scripts/               # Automation scripts
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   ├── lib/
│   │   ├── edgar-api/     # SEC EDGAR API client
│   │   ├── parsers/       # Form parsers
│   │   ├── events/        # Event extraction
│   │   ├── database/      # Database connection
│   │   ├── middleware/    # API middleware
│   │   └── utils/         # Utility functions
│   ├── pages/
│   │   ├── api/           # API routes
│   │   └── index.tsx      # Main page
│   └── styles/            # CSS styles
├── prisma/                # Database schema
├── .env.example          # Environment variables template
├── package.json          # Project dependencies
├── vercel.json           # Vercel configuration
└── README.md             # Documentation
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
