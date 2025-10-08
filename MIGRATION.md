# Migration Guide: MVP to Full Job Platform

This guide helps you migrate from the MVP version to the new full-featured job posting platform with CV uploads.

## Database Migration

### Step 1: Backup Your Data

```bash
# Backup existing applications
pg_dump $DATABASE_URL --table=job_applications > backup_applications.sql
```

### Step 2: Update Schema

Run Prisma migrations to add new tables and columns:

```bash
npx prisma generate
npx prisma db push
```

This will:
- Add `jobs` table for job postings
- Add `job_id`, `email`, and `cv_url` columns to `job_applications`
- Create foreign key relationship between applications and jobs

### Step 3: Verify Migration

Check that new columns exist:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'job_applications';
```

You should see:
- `job_id` (integer, nullable)
- `email` (varchar, nullable)
- `cv_url` (text, nullable)

## Environment Variables

### Add to .env

```env
# NEW: Cloudflare R2 Storage
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET_NAME="your_bucket_name"
R2_PUBLIC_URL="https://your-bucket.r2.dev"
```

## Cloudflare R2 Setup

### 1. Create R2 Bucket

1. Log in to Cloudflare Dashboard
2. Go to R2 Storage
3. Create a new bucket (e.g., `oba-cvs`)
4. Note the bucket name

### 2. Generate API Credentials

1. Go to R2 → Manage R2 API Tokens
2. Create API token with "Object Read & Write" permissions
3. Save Access Key ID and Secret Access Key

### 3. Setup Public Access (Optional)

For direct CV downloads:

1. Go to your R2 bucket settings
2. Enable "Public Access" or setup custom domain
3. Update `R2_PUBLIC_URL` in .env

Alternatively, use signed URLs (already implemented in `src/lib/r2.ts`)

## Testing the Migration

### 1. Test Job Creation

1. Login to `/admin`
2. Navigate to "Vakansiyalar" tab
3. Create a test job posting
4. Verify it appears in the list

### 2. Test Application Flow

1. Visit homepage `/`
2. You should see active jobs listed
3. Click on a job to apply
4. Upload a test CV file
5. Submit application
6. Verify in admin panel:
   - Application appears in table
   - Job title is shown
   - CV download link works

### 3. Test Existing Applications

Old applications (without `job_id`) will:
- Display as "Ümumi" (General) in the Vakansiya column
- Still show all other data correctly
- Export to Excel normally

## New Features Summary

### For HR Admins
- ✅ Create and manage job postings
- ✅ Track applications per job
- ✅ Download applicant CVs
- ✅ See applicant emails

### For Applicants
- ✅ Browse active job listings
- ✅ Apply to specific jobs
- ✅ Upload CV (PDF, DOC, DOCX)
- ✅ Submit general applications (no specific job)

## Rollback Plan

If you need to rollback:

1. Restore database backup:
```bash
psql $DATABASE_URL < backup_applications.sql
```

2. Revert to previous git commit:
```bash
git log --oneline  # Find previous commit
git revert <commit-hash>
```

3. Reinstall old dependencies:
```bash
npm install
```

## Common Issues

### Issue: R2 Upload Fails

**Solution:** Check R2 credentials and bucket permissions

```bash
# Test R2 connection
curl -X PUT \
  --aws-sigv4 "aws:amz:auto:s3" \
  --user "${R2_ACCESS_KEY_ID}:${R2_SECRET_ACCESS_KEY}" \
  "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/test.txt"
```

### Issue: Jobs Not Showing

**Solution:** Make sure jobs have `status = 'active'`

```sql
UPDATE jobs SET status = 'active' WHERE status IS NULL;
```

### Issue: Missing CV Downloads

**Solution:** Verify R2_PUBLIC_URL is correct and bucket has public access OR use signed URLs (already implemented)

## Support

For issues, check:
1. Browser console for errors
2. Server logs: `npm run dev`
3. Database connection: `npx prisma studio`
4. R2 bucket permissions in Cloudflare dashboard
