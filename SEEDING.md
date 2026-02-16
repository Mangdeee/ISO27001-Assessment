# Database Auto-Seeding

The backend automatically seeds initial data on startup if the database tables are empty.

## How It Works

1. **On Backend Startup**: When the backend server starts, it automatically checks if the database tables have any data.

2. **Idempotent Seeding**: 
   - If `gap_assessments` table is empty → seeds from `sample_gap_data.json`
   - If `maturity_assessments` table is empty → seeds from `sample_maturity_data.json`
   - If tables already have data → **skips seeding** (no data is modified or duplicated)

3. **Seed Files Location**: 
   - The seed files (`sample_gap_data.json` and `sample_maturity_data.json`) are copied into the `backend/` directory
   - They are also included in the Docker image at `/root/` (working directory)

## Behavior

- ✅ **First Deployment**: Tables are empty → Data is automatically seeded
- ✅ **Subsequent Deployments**: Tables have data → Seeding is skipped (no changes)
- ✅ **Manual Data Added**: If you add data manually, seeding won't overwrite it
- ✅ **Safe**: Seeding only happens if tables are completely empty

## Seed Files

- `sample_gap_data.json` - Initial gap assessment records
- `sample_maturity_data.json` - Initial maturity assessment records

## Logs

When the backend starts, you'll see logs like:

```
Checking if database seeding is needed...
gap_assessments table already has data, skipping seed
maturity_assessments table already has data, skipping seed
```

Or on first run:

```
Checking if database seeding is needed...
Seeding gap_assessments table...
Found gap data file at: ./sample_gap_data.json
Inserted 11 gap assessments
Successfully seeded gap_assessments
Seeding maturity_assessments table...
Found maturity data file at: ./sample_maturity_data.json
Inserted 11 maturity assessments
Successfully seeded maturity_assessments
```

## Manual Seeding (Optional)

If you need to manually trigger seeding or reset data:

1. **Reset and Reseed**: Clear the tables and restart the backend
   ```sql
   TRUNCATE TABLE gap_assessments CASCADE;
   TRUNCATE TABLE maturity_assessments CASCADE;
   ```
   Then restart the backend - it will auto-seed again.

2. **Disable Auto-Seeding**: If you want to disable auto-seeding, you can set an environment variable or modify the code, but by default it's enabled and safe.

## Updating Seed Data

To update the seed data:

1. Edit `sample_gap_data.json` or `sample_maturity_data.json` in the project root
2. Copy them to `backend/` directory:
   ```bash
   cp sample_gap_data.json sample_maturity_data.json backend/
   ```
3. Rebuild and redeploy the backend

The new seed data will be used on the next deployment if the tables are empty.
