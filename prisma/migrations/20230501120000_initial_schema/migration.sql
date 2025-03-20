-- prisma/migrations/20230501120000_initial_schema/migration.sql
-- CreateTable for users, events, companies, watchlists, alerts
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionTier" TEXT DEFAULT 'free',
    "subscriptionEnd" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Additional tables with proper indexes
CREATE INDEX "Event_cik_idx" ON "Event"("cik");
CREATE INDEX "Event_ticker_idx" ON "Event"("ticker");
CREATE INDEX "Event_type_idx" ON "Event"("type");
CREATE INDEX "Event_executionDate_idx" ON "Event"("executionDate");
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- Create materialized view for faster event lookups
CREATE MATERIALIZED VIEW "EventSummary" AS
SELECT 
    "cik",
    "companyName",
    "ticker",
    COUNT(*) as "totalEvents",
    MAX("updatedAt") as "lastEventDate"
FROM "Event"
GROUP BY "cik", "companyName", "ticker";

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_event_summary()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW "EventSummary";
    RETURN NULL;
END $$;

-- Trigger to refresh materialized view
CREATE TRIGGER refresh_event_summary_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Event"
FOR EACH STATEMENT EXECUTE FUNCTION refresh_event_summary();

-- Additional indexes for performance
CREATE INDEX "Company_name_idx" ON "Company" USING gin("name" gin_trgm_ops);
