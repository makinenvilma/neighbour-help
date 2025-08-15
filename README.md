# 🏠 Neighbour Help Web App

A community-focused platform that connects residents living in the same building.  
Users can request help from neighbours, share updates, and make announcements related to their housing community.  
Built as a full-stack application, it showcases modern web development, client–server communication, and database integration.

## Features

- **Help Requests** – Ask neighbours for assistance quickly and easily.  
- **Announcements** – Share important information with all residents.  
- **Community Updates** – Post and follow news within your building.  
- **Secure Access** – Intended for residents only.  
- **Responsive UI** – Works seamlessly on desktop and mobile devices.

## Screenshots

**Front Page**  
_Example view of the app’s homepage._

**Announcement Section**  
_Example view of the announcement area._

## Tech Stack

- **Front-end:** TypeScript, Next.js, React, Tailwind CSS  
- **Back-end:** Next.js API routes, Prisma ORM  
- **Database:** PostgreSQL  

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neighbour-help-app.git
   cd neighbour-help-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file in the project root:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   NEXT_PUBLIC_API_KEY=your_api_key
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## How It Works

- **Next.js** serves both front-end pages and back-end API routes.  
- **Prisma** manages database queries and migrations for PostgreSQL.  
- **Vercel** hosts the application with automatic deployments.  
- **Tailwind CSS** ensures a modern, responsive interface.
