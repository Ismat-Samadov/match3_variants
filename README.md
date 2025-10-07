# 🏪 Bizim Oba - Job Application Platform

A modern, full-stack job application management system built with Next.js, designed for OBA retail stores in Azerbaijan.

## 📸 Screenshots

### Application Form
![Application Form](./ss/application%20page.png)
*Interactive job application form with map-based location selection*

### Admin - Applications Management
![Applications Page](./ss/candidates%20page.png)
*Comprehensive view of all applications with search, filtering, and export features*

### Admin - Analytics Dashboard
![Analytics Dashboard](./ss/analytics%20page.png)
*Visual analytics with statistics, charts, and distribution data*

## 🚀 Features

### 📝 Public Job Application Form
- **Interactive Map Selection** - Applicants can select their preferred work location from an interactive Leaflet map
- **Geolocation Support** - Find your location feature to show nearby stores
- **Real-time Location Distance** - Shows distance from applicant's location to each store
- **Multi-field Form** - Collects name, surname, phone, current location, job title, expected salary, and additional info
- **Fully Responsive** - Mobile-first design that works perfectly on all devices
- **Azerbaijani Language** - Complete UI in Azerbaijani with proper translations

### 🔐 Admin Panel (Protected)
- **Secure Authentication** - Login system with environment-based credentials
- **Two Main Views:**
  - **📋 Applications Table** - View all job applications with sorting and filtering
  - **📈 Analytics Dashboard** - Visual insights and statistics

### 📊 Analytics Features
- **Key Metrics Cards:**
  - Total applications count
  - Average salary expectations
  - Number of unique locations
  - Number of unique job positions

- **Distribution Charts:**
  - Job titles distribution with progress bars
  - Top 10 locations by application count
  - Salary range distribution (500-700, 700-900, 900-1100, 1100+ AZN)

- **Visual Design:**
  - Beautiful gradient progress bars
  - Color-coded statistics
  - Percentage calculations
  - Smooth animations

### 🗂️ Application Management
- **Advanced Filtering:**
  - Search by name, phone, or job title
  - Filter by work location
  - Real-time search results

- **Pagination System:**
  - 5 applications per page
  - Page navigation with numbered buttons
  - Shows current range (e.g., "Showing 1-5 of 26")

- **Data Export:**
  - Export to Excel (.xlsx) format
  - Customizable columns
  - Proper Azerbaijani headers
  - Auto-generated filename with date

### 📱 Mobile Responsive
- **Fully optimized for mobile devices**
- Touch-friendly buttons and inputs
- Adaptive layouts for all screen sizes
- Horizontal scroll for tables on small screens
- Responsive text and spacing

## 🛠️ Tech Stack

- **Framework:** Next.js 15.1.3 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Neon)
- **ORM:** Raw SQL queries with pg
- **Maps:** Leaflet + React-Leaflet
- **Excel Export:** xlsx library
- **Deployment:** Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+
- npm/yarn/pnpm/bun
- PostgreSQL database (Neon or local)

## 🔧 Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd obamiz
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require&schema=oba"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

4. **Set up the database:**

Run the SQL schema to create the required tables:

```sql
CREATE SCHEMA IF NOT EXISTS oba;

CREATE TABLE oba.job_applications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  current_living_place VARCHAR(255) NOT NULL,
  place_to_work VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  expected_salary INTEGER NOT NULL,
  info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. **Add location data:**

Import the `data/locations.csv` file with your store locations (latitude, longitude, name).

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

## 📂 Project Structure

```
obamiz/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin panel page
│   │   ├── api/                # API routes
│   │   │   ├── applications/   # Get all applications
│   │   │   ├── apply/          # Submit application
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   └── locations/      # Get store locations
│   │   ├── components/         # React components
│   │   │   └── MapSelector.tsx # Interactive map component
│   │   ├── page.tsx            # Main application form
│   │   └── layout.tsx          # Root layout
│   └── types/                  # TypeScript type definitions
├── data/
│   └── locations.csv           # Store locations data
├── public/                     # Static assets
└── .env                        # Environment variables
```

## 🎯 Key Pages

### Public Pages
- `/` - Job application form

### Protected Pages (Admin)
- `/admin` - Login & admin dashboard
  - Applications tab: View and manage applications
  - Analytics tab: View statistics and insights

## 🔑 Admin Access

Default credentials (change in `.env`):
- **Username:** `admin`
- **Password:** `admin123`

**Important:** Change these credentials in production!

## 🌍 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `ADMIN_USERNAME` | Admin panel username | Yes |
| `ADMIN_PASSWORD` | Admin panel password | Yes |

## 📊 Database Schema

### job_applications table
```sql
id                    SERIAL PRIMARY KEY
name                  VARCHAR(255)
surname               VARCHAR(255)
phone                 VARCHAR(20)
current_living_place  VARCHAR(255)
place_to_work         VARCHAR(255)
job_title             VARCHAR(255)
expected_salary       INTEGER
info                  TEXT (nullable)
created_at            TIMESTAMP
```

## 🎨 Features in Detail

### Interactive Map
- Built with Leaflet.js
- Custom markers for each OBA store
- Click markers to select location
- Shows distance from user's location
- Zoom and pan controls
- Mobile-optimized touch controls

### Form Validation
- All required fields validated
- Phone number format checking
- Location must be selected from map
- Client-side and server-side validation

### Admin Features
- Secure cookie-based authentication
- Session persistence (24 hours)
- Excel export with formatted data
- Real-time search and filtering
- Responsive table with horizontal scroll
- Color-coded status indicators

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Environment Setup

Make sure to add all environment variables in your Vercel project settings:
- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## 🔒 Security

- HTTP-only cookies for authentication
- Secure flag enabled in production
- SameSite cookie policy
- Environment-based credentials
- SQL injection protection via parameterized queries

## 🎯 Future Enhancements

Potential features for future versions:
- Application status workflow (New → Reviewing → Interview → Hired/Rejected)
- Email/SMS notifications
- Interview scheduling
- Document upload (CV, certificates)
- Multi-language support (Russian, English)
- AI-powered candidate scoring
- Advanced analytics with charts
- Role-based access control
- Application notes and ratings

## 📝 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For access or contributions, please contact the project owner.

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## 📞 Support

For support, please contact the development team.

---

Built with ❤️ for OBA Stores in Azerbaijan
