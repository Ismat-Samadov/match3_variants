# Changelog

## [2.0.0] - Job Posting Platform Update

### 🎉 Major Features Added

#### Job Posting System
- **Job Management Interface** (`/admin/jobs`)
  - Create, edit, delete job postings
  - Rich job details: title, description, location, salary range, employment type
  - Requirements and responsibilities fields
  - Status management (active, closed, draft)
  - Application count tracking per job

#### CV Upload & Storage
- **Cloudflare R2 Integration**
  - CV file upload (PDF, DOC, DOCX)
  - File validation (type and 5MB size limit)
  - Secure storage in Cloudflare R2 bucket
  - Public and signed URL support

- **CV Management**
  - Direct download links in admin panel
  - CV URLs included in Excel exports
  - File naming with timestamps

#### Enhanced Application Flow
- **Job Listings Page**
  - Browse active job postings on homepage
  - Job cards with title, location, salary range
  - Apply to specific jobs or submit general applications

- **Application Form Updates**
  - Email field added (optional)
  - CV upload field (optional)
  - Dynamic form based on job selection
  - Loading states for CV upload

#### Admin Panel Enhancements
- **Updated Applications View**
  - New "Vakansiya" column showing job posting
  - Email column
  - CV download button
  - Enhanced table with job-specific data

- **Excel Export Updates**
  - Added Email column
  - Added Vakansiya (Job Posting) column
  - Added CV URL column
  - Expanded column widths

### 📦 New Dependencies
- `@aws-sdk/client-s3` - S3-compatible client for R2
- `@aws-sdk/s3-request-presigner` - Generate signed URLs

### 🗄️ Database Changes

#### New Table: `jobs`
```sql
- id (Primary Key)
- title
- description
- location
- salary_min
- salary_max
- employment_type
- requirements
- responsibilities
- status
- created_at
- updated_at
```

#### Updated Table: `job_applications`
```sql
+ job_id (Foreign Key to jobs)
+ email
+ cv_url
```

### 🔧 New Files
- `src/lib/r2.ts` - R2 upload utilities
- `src/app/api/upload-cv/route.ts` - CV upload endpoint
- `src/app/api/jobs/route.ts` - Jobs CRUD endpoints
- `src/app/api/jobs/[id]/route.ts` - Single job operations
- `src/app/admin/jobs/page.tsx` - Job management UI
- `.env.example` - Environment template
- `MIGRATION.md` - Migration guide
- `CHANGELOG.md` - This file

### 🔄 Modified Files
- `src/app/page.tsx` - Job listings + application form
- `src/app/admin/page.tsx` - Enhanced applications table
- `src/app/api/apply/route.ts` - Support job_id, email, cv_url
- `src/app/api/applications/route.ts` - Include job relation
- `prisma/schema.prisma` - New jobs table and updated schema
- `package.json` - New dependencies
- `README.md` - Updated documentation

### 🌍 New Environment Variables
- `R2_ACCOUNT_ID` - Cloudflare account ID
- `R2_ACCESS_KEY_ID` - R2 access key
- `R2_SECRET_ACCESS_KEY` - R2 secret key
- `R2_BUCKET_NAME` - Bucket name for CVs
- `R2_PUBLIC_URL` - Public URL for R2 bucket

### ⚙️ API Changes

#### New Endpoints
- `GET /api/jobs?active=true` - Get active job postings
- `POST /api/jobs` - Create job (admin)
- `GET /api/jobs/[id]` - Get single job
- `PUT /api/jobs/[id]` - Update job (admin)
- `DELETE /api/jobs/[id]` - Delete job (admin)
- `POST /api/upload-cv` - Upload CV to R2

#### Updated Endpoints
- `POST /api/apply` - Now accepts jobId, email, cvUrl
- `GET /api/applications` - Now includes job relation

### 🎨 UI/UX Improvements
- Job listing cards on homepage
- Selected job indicator during application
- CV upload progress states
- Job posting badge in applications table
- Enhanced mobile responsiveness
- "Vakansiyalar" tab in admin panel

### 🔒 Security
- File type validation for CV uploads
- File size limits (5MB)
- Secure R2 credentials handling
- Admin-only job management endpoints

### 📱 Backward Compatibility
- ✅ Existing applications work without modification
- ✅ Old applications show as "Ümumi" (General)
- ✅ All existing features remain functional
- ✅ Database migration is non-destructive (adds columns)

### 🐛 Bug Fixes
- None (new features only)

### 📝 Documentation
- Updated README with new features
- Added MIGRATION.md guide
- Added .env.example template
- Updated project structure
- Enhanced deployment instructions

### 🚀 Performance
- Parallel tool loading maintained
- Efficient R2 upload with streaming
- Optimized database queries with Prisma

### 🔄 Migration Notes
See `MIGRATION.md` for detailed migration instructions.

**Breaking Changes:** None - fully backward compatible

**Recommended Actions:**
1. Set up Cloudflare R2 bucket
2. Add R2 environment variables
3. Run `npx prisma generate && npx prisma db push`
4. Test job creation and application flow

---

## [1.0.0] - Initial MVP Release

### Features
- Job application form with map selection
- Admin panel with authentication
- Applications management
- Analytics dashboard
- Excel export
- PostgreSQL database
- 1,610 OBA store locations
