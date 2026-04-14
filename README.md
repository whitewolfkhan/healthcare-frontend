# Healthcare Frontend
# Link : https://healthcare-frontend-pink.vercel.app

A modern healthcare management system frontend built with Next.js, providing role-based dashboards for administrators, doctors, and patients.

## Features

- **Authentication**: Login, registration, password reset, and Google OAuth integration
- **Role-based Access Control**: Separate dashboards for Admin, Doctor, and Patient roles
- **Patient Management**: View and manage patient records, appointments, medical history
- **Doctor Dashboard**: Manage appointments, prescriptions, lab results, and patient care
- **Admin Panel**: User management, department management, analytics, and system administration
- **Medical Records**: Upload and view medical images, lab results, prescriptions, and vital signs
- **Notifications**: Real-time notifications for appointments and updates
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with PostCSS
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Charts**: Recharts
- **HTTP Client**: Axios
- **UI Components**: Headless UI
- **Icons**: React Icons
- **Date Handling**: date-fns
- **Authentication**: Google OAuth, JWT tokens

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Backend API server running (default: http://localhost:5000)

## Installation

1. Clone the repository:
   ```bash
   git clone <frontend-repo-url>
   cd healthcare-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Production Build

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Docker

Build and run with Docker:
```bash
docker build -t healthcare-frontend .
docker run -p 3000:3000 healthcare-frontend
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend base URL for uploads | `http://localhost:5000` |

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard routes
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # UI components
│   ├── forms/            # Form components
│   ├── charts/           # Chart components
│   └── layout/           # Layout components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── api.js            # API client
│   ├── auth.js           # Authentication utilities
│   └── store.js          # Zustand store
├── public/                # Static assets
├── Dockerfile             # Docker configuration
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

