# Klipst - Property Management Platform

A comprehensive property management web application built with Next.js, PostgreSQL, and modern web technologies.

## Features

- 🏠 **Property Management**: Complete CRUD operations for properties
- 👥 **User Management**: Landlords, tenants, and admin roles
- 💳 **Payment Processing**: Stripe and PayPal integration
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🔐 **Authentication**: NextAuth.js with multiple providers
- 📄 **Document Management**: File uploads for contracts and IDs
- 🗺️ **Map Integration**: Interactive maps with Leaflet.js
- 🔍 **Advanced Search**: Location-based search with filters
- 📊 **Admin Dashboard**: Comprehensive management interface
- 🌐 **Multi-language**: i18n support ready
- 🎨 **Theming**: Dark/light mode with customizable themes

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Stripe, PayPal
- **File Upload**: Custom upload handler
- **Maps**: Leaflet.js
- **Deployment**: Vercel/Docker ready

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)
- Google Places API key (optional)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/timastana/Klipst.git
cd Klipst
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

Fill in your environment variables in `.env`.

4. Set up the database:
\`\`\`bash
npm run db:push
npm run db:seed
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Docker Setup

1. Build and run with Docker Compose:
\`\`\`bash
npm run docker:up
\`\`\`

2. The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── properties/        # Property pages
│   └── admin/             # Admin dashboard
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── types/                # TypeScript type definitions
\`\`\`

## Key Features

### Property Management
- Create, read, update, delete properties
- Image gallery with multiple photos
- Advanced filtering and search
- Map view with property pins
- Property comparison

### User Roles
- **Admin**: Full system access
- **Landlord**: Property management, tenant communication
- **Tenant**: Property search, applications, payments

### Payment System
- Stripe integration for card payments
- PayPal support
- Automated rent collection
- Payment history and receipts

### Security
- JWT-based authentication
- Role-based access control
- Secure file uploads
- Input validation and sanitization

## API Endpoints

### Properties
- `GET /api/properties` - List properties with filters
- `POST /api/properties` - Create new property
- `GET /api/properties/[id]` - Get property details
- `PUT /api/properties/[id]` - Update property
- `DELETE /api/properties/[id]` - Delete property

### Payments
- `POST /api/payments/stripe` - Create Stripe payment intent
- `POST /api/payments/webhook` - Handle payment webhooks

### File Upload
- `POST /api/upload` - Upload files

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

- **User**: User accounts with roles
- **Property**: Property listings
- **Application**: Rental applications
- **RentPayment**: Payment records
- **Document**: File attachments
- **Notification**: User notifications

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker
1. Build the Docker image:
\`\`\`bash
docker build -t klipst .
\`\`\`

2. Run with docker-compose:
\`\`\`bash
docker-compose up -d
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@klipst.com or create an issue on GitHub.
