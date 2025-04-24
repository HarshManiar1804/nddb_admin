# NDDB Project

A comprehensive management system for the National Dairy Development Board (NDDB), focusing on species, bird, and campus management.

## Project Overview

The NDDB Admin Project is a full-stack application designed to manage and track various aspects of the NDDB system, including species information, bird data, campus management, and related resources.

## Project Structure

```
nddb_admin/
├── frontend/     # Main user-facing application
├── backend/      # API and server implementation
└── admin/        # Admin dashboard interface
```

## Features

### Admin Dashboard

- Species Management
  - Tree species information
  - Scientific and Hindi names
  - IUCN status tracking
  - QR code
- Bird Management
  - Comprehensive bird data
  - Migration status
  - Habitat preferences
  - Ecological role tracking
- Campus Management
  - Location tracking
  - Species distribution
- Tree Location Management
  - GPS coordinates
  - Campus mapping
- Botany Management
  - Botanical classifications
  - Species categorization

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components

### Backend

- Node.js
- Express.js
- PostgreSQL Database

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Git

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd nddb_admin
```

2. Install dependencies for each component:

```bash
# Install admin dependencies
cd admin
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
   - Create `.env` files in each component directory
   - Configure database connection strings
   - Set up API endpoints

## Development

### Running the Admin Panel

```bash
cd admin
npm run dev
```

### Running the Backend

```bash
cd backend
npm run dev
```

### Running the Frontend

```bash
cd frontend
npm run dev
```

## Available Scripts

### Admin Panel

- `npm run dev` - Start development server
- `npm run build` - Build for production

### Backend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations

## API Documentation

The backend API provides endpoints for:

- Species management
- Bird data management
- Campus information
- Tree locations
- Botany data

Detailed API documentation is available in the backend directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[Your License Here]

## Support

For support, please contact:

- Email: [support email]
- Documentation: [documentation link]
- Issue Tracker: [issue tracker link]
