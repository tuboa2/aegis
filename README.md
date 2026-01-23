# 🌍 Aegis - AI-Powered Disaster Management Platform

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)

A comprehensive disaster monitoring and community response system that combines real-time data visualization, AI-driven analytics, and crowdsourced reporting to protect communities during natural disasters.

## ✨ Features

### 🏠 Core Functionality
- **Real-time Disaster Monitoring** - Live alerts for earthquakes, floods, storms, wildfires, and volcanic activity
- **Interactive Map Visualization** - Geographic display of active disasters with severity-based color coding
- **AI-Powered Analytics** - GPT-4 powered risk assessments and predictive insights
- **Natural Language Queries** - Conversational AI assistant for disaster information

### 👥 Community Features
- **Crowdsourced Reporting** - User-generated disaster reports with media uploads
- **Content Verification** - Admin moderation system for report validation
- **Social Engagement** - Comments, upvotes, and sharing capabilities
- **Safety Hub** - Comprehensive disaster preparedness resources and emergency contacts

### 🔧 Technical Features
- **Multi-source Data Integration** - External API connections with caching and fallbacks
- **Location Services** - GPS-based reporting with privacy controls
- **Responsive Design** - Mobile-first approach with modern UI components
- **Role-based Access Control** - Admin panel for content moderation

## 🏗️ Architecture

### Backend Stack
- **Framework**: Laravel 11.x (PHP 8.2+)
- **Database**: MySQL 8.0+
- **Authentication**: Laravel Sanctum
- **AI Integration**: OpenRouter API (GPT-4)
- **File Storage**: Laravel Storage (local/cloud)
- **Caching**: Redis/File-based caching

### Frontend Stack
- **Framework**: React 18.x with TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui + Tailwind CSS
- **State Management**: React hooks + Context API
- **Maps**: Leaflet.js for interactive mapping
- **Animations**: Framer Motion

## 📋 Prerequisites

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18.0
- **npm** or **pnpm**
- **MySQL** >= 8.0
- **Redis** (optional, for enhanced caching)

## 🚀 Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aegis.git
   cd aegis/backend
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configure database**
   ```bash
   # Update .env with your database credentials
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=aegis
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. **Run migrations and seeders**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Configure AI service**
   ```bash
   # Add your OpenRouter API key to .env
   OPENROUTER_API_KEY=your_api_key_here
   ```

7. **Start the backend server**
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   # Update API base URL to match your backend
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

## 🎯 Usage

### Accessing the Application

1. **Backend API**: `http://localhost:8000`
2. **Frontend Application**: `http://localhost:5173`

### User Roles

- **Public Users**: View disaster alerts, community reports, and safety resources
- **Registered Users**: Submit reports, comment, upvote, and access personalized features
- **Administrators**: Moderate content, verify reports, and manage community resources

### Key Workflows

1. **View Live Disasters**: Navigate to the dashboard map to see real-time alerts
2. **Submit Community Report**: Use the community tab to report local incidents
3. **Access Safety Resources**: Visit the Safety Hub for disaster-specific guidance
4. **AI Assistance**: Ask questions through the AI Chat interface

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/register          - User registration
POST   /api/login             - User login
POST   /api/logout            - User logout
GET    /api/user              - Get authenticated user
```

### Disaster Alert Endpoints
```
GET    /api/alerts            - List active disaster alerts
GET    /api/alerts/{id}       - Get specific alert details
```

### Community Endpoints
```
GET    /api/community/reports              - List community reports
POST   /api/community/reports              - Create new report
GET    /api/community/reports/{id}         - Get report details
POST   /api/community/reports/{id}/comments - Add comment
POST   /api/community/reports/{id}/upvote   - Upvote report
GET    /api/community/safety-tips          - Get safety tips
```

### Admin Endpoints (Requires Admin Authentication)
```
GET    /api/admin/reports/pending    - Get pending reports
POST   /api/admin/reports/{id}/verify - Verify report
POST   /api/admin/reports/{id}/reject - Reject report
GET    /api/admin/community-stats    - Community statistics
```

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and authentication
- `disaster_alerts` - Official disaster alert data
- `user_reports` - Community-submitted reports
- `report_comments` - User comments on reports
- `report_upvotes` - User upvotes for engagement
- `safety_tips` - Educational content and resources
- `ai_summaries` - Cached AI-generated analyses
- `query_logs` - User query tracking

## 🧪 Testing

### Backend Testing
```bash
cd backend
php artisan test
```

### Frontend Testing
```bash
cd frontend
pnpm test
# or
npm test
```

### Test Coverage
- Unit tests for core business logic
- Feature tests for API endpoints
- Integration tests for user workflows
- E2E tests for critical user journeys

## 🔧 Development

### Code Quality
- **PHP**: PSR-12 coding standards
- **JavaScript/TypeScript**: ESLint configuration
- **Git Hooks**: Pre-commit quality checks

### Environment Variables
```env
# Backend (.env)
APP_NAME=Aegis
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aegis
DB_USERNAME=
DB_PASSWORD=

OPENROUTER_API_KEY=

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Aegis
```

## 🚀 Deployment

### Production Considerations
- **SSL Certificate**: Required for geolocation services
- **File Storage**: Configure cloud storage (AWS S3, etc.)
- **Caching**: Implement Redis for production caching
- **Monitoring**: Set up error tracking and performance monitoring
- **Backup**: Configure automated database backups

### Docker Deployment (Optional)
```bash
# Build and run with Docker
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PSR-12 for PHP code
- Use TypeScript for all React components
- Write tests for new features
- Update documentation as needed
- Ensure responsive design for all features

## 🙋 Support

For support, email support@aegis-platform.com or join our Discord community.

## 🙏 Acknowledgments

- **Laravel** - The PHP framework for web artisans
- **React** - A JavaScript library for building user interfaces
- **OpenAI** - For providing powerful AI capabilities
- **Open-source contributors** - For their valuable contributions

---

**Built with ❤️ for community safety and disaster preparedness**