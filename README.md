# CS 432: Web Programming
## Final Project
> This repository is for the CS 432: Web Programming Final Project.

This project belongs to the group consisting of:
- Taewon Kwon
- Benji Kiblinger
- Michael White
- Jeffery Lin

## Project Overview

**Commie** is a comprehensive web-based parliamentary motion management and voting platform designed for organizations, committees, and community governance. The application implements Robert's Rules of Order, providing a complete digital solution for democratic decision-making, motion tracking, voting, and discussion management.

## Live Deployment

**Vercel**: [https://csci432-web-dev-final-project.vercel.app](https://csci432-web-dev-final-project.vercel.app)

## Purpose

This platform provides a complete digital governance solution for organizations following parliamentary procedure. The system supports multi-tenant organizations, committee management, and full parliamentary motion workflows.

### Key Capabilities:
- **Organization Management**: Multi-tenant support with invite codes
- **Committee Governance**: Create and manage committees with role-based access
- **Motion Lifecycle**: Full parliamentary motion system with subsidiary motions (amendments, table, postpone, etc.)
- **Democratic Voting**: Configurable voting thresholds (majority, supermajority, unanimous) with automatic motion resolution
- **Discussion Forums**: Comment and debate motions with stance tracking (pro/con/neutral)
- **Notifications**: Real-time alerts for access requests, voting periods, and motion updates
- **Access Control**: Comprehensive role-based permissions (super-admin, org-admin, chair, member, guest)

## Tech Stack

### Frontend
- **Framework**: React 19.2.1
- **Build Tool**: Vite 7.1.6
- **Routing**: React Router DOM 7.9.1
- **Styling**: Tailwind CSS 4.1.13
- **Icons**: React Icons 5.5.0

### Backend
- **Runtime**: Node.js with Express.js 4.18.2
- **Database**: MongoDB 6.20.0
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Validation**: express-validator 7.0.1
- **CORS**: cors 2.8.5

### Development Tools
- **Linting**: ESLint 9.35.0 with React plugins
- **Docker**: Docker Compose for local MongoDB

## Project Structure

```
csci432-web-dev-final-project/
├── src/                           # Frontend source code
│   ├── components/                # React components
│   │   ├── controls/              # Committee control components
│   │   ├── reusable/              # Reusable UI components (Header, Sidebar, Tabs)
│   │   ├── AdminPanel.jsx         # Platform admin panel
│   │   ├── ChairControlPanel.jsx  # Committee chair controls
│   │   ├── CommitteesPage.jsx     # Committee listing and management
│   │   ├── CommitteeMotionsPage.jsx  # Motion listing within committee
│   │   ├── MotionDetailsComments.jsx # Motion details and discussion
│   │   ├── CreateCommitteePage.jsx   # Committee creation
│   │   ├── CreateMotionPage.jsx      # Motion creation
│   │   ├── ProfilePage.jsx        # User profile
│   │   ├── SettingsPage.jsx       # User settings
│   │   └── ...
│   ├── services/                  # API client services
│   ├── App.jsx                    # Main app component with routing
│   ├── main.jsx                   # Application entry point
│   ├── index.css                  # Global styles with Tailwind
│   └── style.css                  # Additional custom styles
├── backend/                       # Backend API server
│   ├── routes/                    # Express route handlers
│   │   ├── auth.js                # Authentication routes
│   │   ├── committees.js          # Committee management
│   │   ├── motions.js             # Motion management
│   │   ├── votes.js               # Voting system
│   │   ├── comments.js            # Discussion/comments
│   │   ├── notifications.js       # Notification system
│   │   ├── organizations.js       # Organization management
│   │   └── motionControl.js       # Motion control (seconding, voting eligibility)
│   ├── middleware/                # Express middleware
│   │   └── auth.js                # Authentication & authorization
│   ├── models/                    # MongoDB models
│   │   ├── User.js
│   │   ├── Organization.js
│   │   ├── Committee.js
│   │   ├── Motion.js
│   │   ├── Vote.js
│   │   ├── Comment.js
│   │   └── Notification.js
│   ├── config/                    # Configuration files
│   │   └── database.js
│   ├── migrations/                # Database migrations
│   └── server.js                  # Express server entry point
├── api/                           # Vercel serverless API wrapper
│   └── index.js                   # Vercel API entry point
├── public/                        # Static assets
├── index.html                     # HTML entry point
├── api-doc.md                     # Complete API documentation
├── database-structure.md          # Database schema documentation
├── package.json                   # Project dependencies and scripts
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── docker-compose.yml             # Docker setup for local MongoDB
└── README.md                      # This file
```

## Features

### Authentication & User Management
- **User Registration & Login**: Secure JWT-based authentication with bcrypt password hashing
- **User Profiles**: Customizable profiles with bio, contact information, and profile pictures
- **User Settings**: Theme preferences (light/dark mode), notification settings, display name customization
- **Organization Membership**: Users can join organizations via invite codes
- **Role Management**: Platform-level and organization-level role assignment

### Organization Management
- **Multi-Tenant System**: Support for multiple independent organizations
- **Organization Creation**: Create and manage organizations with custom settings
- **Invite System**: Unique invite codes for organization membership (format: ORG-{slug}-{random})
- **Admin Controls**: Organization admins can manage members, committees, and settings
- **Custom Branding**: Logo and color customization per organization

### Committee Management
- **Committee Creation**: Create committees within organizations with descriptions and member lists
- **Role-Based Access**: Committee roles include owner, chair, member, and guest
- **Member Management**: Add/remove members, assign roles, track join dates
- **Committee Settings**: Configurable quorum requirements, discussion time minimums, voting rules
- **Chair Controls**: Dedicated control panel for committee chairs to manage settings and motions
- **Access Requests**: Users can request access to committees with approval workflow

### Motion System (Parliamentary Procedure)
- **Main Motions**: Primary proposals for committee consideration
- **Subsidiary Motions**: Full support for parliamentary motions including:
  - Amendments (amend)
  - Refer to Committee
  - Postpone
  - Limit/Extend Debate
  - Previous Question (Call the Question)
  - Table the Motion
  - Reconsider
- **Motion Attributes**: Configurable debatable/amendable flags per motion type
- **Motion Lifecycle**: Track motion status (active, passed, failed, tabled, voided)
- **Seconding System**: Require motions to be seconded before voting
- **Motion Filtering**: Filter motions by type, status, and view subsidiary motions

### Voting System
- **Democratic Voting**: Support for yes/no/abstain votes
- **Vote Thresholds**: Configurable voting requirements:
  - Simple Majority (>50%)
  - Supermajority (≥66.67%)
  - Unanimous (100%)
- **Anonymous Voting**: Optional anonymous vote casting
- **Vote Tracking**: Real-time vote counts and participation tracking
- **Auto-Resolution**: Automatic motion closure when vote threshold is met
- **Quorum Validation**: Ensure minimum participation before closing votes
- **Voting Eligibility**: Automatic checks for seconding, discussion time, and required comments
- **Chair Override**: Committee chairs can manually open/close voting periods

### Discussion & Comments
- **Motion Discussion**: Comment threads on each motion
- **Stance Tracking**: Mark comments as pro, con, or neutral
- **System Messages**: Automatic notifications for voting events, eligibility changes
- **Comment Management**: Edit and delete your own comments; chairs can moderate
- **Discussion Requirements**: Configurable minimum discussion time and comment requirements

### Notifications
- **Access Requests**: Notifications for committee access requests with approve/deny actions
- **Voting Alerts**: Notifications when voting opens or deadlines approach
- **Motion Updates**: Alerts for status changes (passed, failed, tabled)
- **Meeting Notifications**: Scheduled meeting reminders
- **Notification Filtering**: Smart filtering based on user role and notification age
- **Auto-Expiration**: Notifications expire 30 minutes after being seen

### Authorization & Security
- **Role-Based Access Control (RBAC)**: Comprehensive permission system
- **Super-Admin**: Platform-wide access across all organizations
- **Organization Admin**: Organization-scoped administrative access
- **Committee Roles**: Owner, chair, member, guest with appropriate permissions
- **Permission System**: Granular permissions for creating, editing, and deleting resources
- **JWT Authentication**: Secure token-based authentication with expiration
- **Password Security**: bcrypt hashing with salt rounds

### User Interface
- **Responsive Design**: Mobile-optimized layout
- **Dark/Light Mode**: User-selectable theme preferences
- **Navigation**: Intuitive sidebar and header navigation
- **Tabbed Interfaces**: Organized control panels and settings pages
- **Real-Time Updates**: Dynamic UI updates without page refresh
- **Loading States**: User feedback during async operations
- **Error Handling**: Clear error messages and validation feedback

## Getting Started

### Prerequisites
- **Node.js**: v16 or higher recommended
- **npm**: Package manager (comes with Node.js)
- **MongoDB**: Local instance or MongoDB Atlas cloud database
- **Docker** (optional): For running MongoDB locally via Docker Compose

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/benjikib/csci432-web-dev-final-project.git
cd csci432-web-dev-final-project
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:

Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/commie_dev
JWT_SECRET=your-secret-key-here
PORT=3001
NODE_ENV=development
```

For production (Vercel), set these environment variables in your deployment platform.

4. **Start MongoDB**:

**Option A: Using Docker Compose** (recommended for development):
```bash
npm run db:up
```

**Option B: Local MongoDB installation**:
Ensure MongoDB is running on `mongodb://127.0.0.1:27017`

**Option C: MongoDB Atlas**:
Update `MONGODB_URI` in `.env` with your Atlas connection string

5. **Start the development servers**:

The application runs both frontend and backend simultaneously:
```bash
npm run dev
```

This starts:
- **Frontend**: Vite dev server at `http://localhost:5173`
- **Backend**: Express API server at `http://localhost:3001`

6. **Access the application**:
Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start both frontend and backend development servers
- `npm run build` - Build the project for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build locally
- `npm run db:up` - Start MongoDB using Docker Compose
- `npm run db:down` - Stop MongoDB Docker container
- `npm run migrate:dry` - Run database migration in dry-run mode
- `npm run migrate:run` - Execute database migration

### Database Migrations

If you need to run database migrations (e.g., for schema updates):

**Dry run** (preview changes without applying):
```bash
npm run migrate:dry
```

**Execute migration**:
```bash
npm run migrate:run
```

## Development

### Code Style
This project uses ESLint for maintaining code quality. The configuration includes:
- React-specific rules
- React Hooks linting
- React Refresh support for fast development
- Modern ES6+ JavaScript standards

Run linting:
```bash
npm run lint
```

### Routing Structure
The application uses React Router DOM 7 with the following routes:

**Public Routes**:
- `/` - Landing/home page
- `/login` - User authentication and registration
- `/callback` - OAuth callback handler
- `/org/:orgSlug/committee/:committeeSlug` - Public committee view
- `/org/:orgSlug/committee/:committeeSlug/motion/:motionSlug` - Public motion view

**Protected Routes** (require authentication):
- `/user-control` - User dashboard and committee overview
- `/profile` - User profile management
- `/settings` - User settings and preferences
- `/notifications` - Notification center
- `/committees` - Committee listing
- `/committee/create` - Create new committee
- `/committee/:committeeId` - Committee details and motions
- `/committee/:committeeId/settings` - Committee settings (chair only)
- `/committee/:committeeId/motion/create` - Create motion
- `/committee/:committeeId/motion/:motionId` - Motion details and voting
- `/committee/:committeeId/motion/:motionId/edit` - Edit motion
- `/chair-control` - Chair control panel (chairs only)

**Admin Routes** (require admin privileges):
- `/admin` - Platform administration panel

### API Structure

The backend API is organized into logical route groups:

- **`/auth`** - Authentication and user management
- **`/committees`** - Committee CRUD operations
- **`/committee/:id`** - Committee-specific operations
- **`/committee/:id/motion`** - Motion management within committees
- **`/committee/:id/motion/:motionId/vote`** - Voting operations
- **`/committee/:id/motion/:motionId/comment`** - Discussion/comments
- **`/motion-control`** - Motion control (seconding, opening/closing votes)
- **`/notifications`** - Notification management
- **`/organizations`** - Organization management

See **[api-doc.md](./api-doc.md)** for complete API documentation.

### Database Schema

The application uses MongoDB with 7 collections:
- **users** - User accounts and authentication
- **organizations** - Multi-tenant organizations
- **committees** - Committees with embedded motions
- **motions** - Standalone motion collection (legacy)
- **votes** - Individual votes on motions
- **comments** - Discussion comments
- **notifications** - User notifications

See **[database-structure.md](./database-structure.md)** for complete schema documentation.

### Architecture Overview

**Frontend (React SPA)**:
- React 19 with functional components and hooks
- Vite for fast development and optimized builds
- Tailwind CSS 4 for styling
- React Router for client-side routing
- Service layer for API communication

**Backend (Express API)**:
- RESTful API design
- JWT-based authentication
- MongoDB with Mongoose-like models
- Middleware for authentication and authorization
- Comprehensive input validation

**Deployment**:
- Vercel for hosting (serverless functions for API)
- MongoDB Atlas for production database
- Environment-based configuration

## Contributing

This project follows a structured Git workflow to maintain code quality:

1. **Never push directly to `main`** - All changes must go through pull requests
2. **Create feature branches** - Use descriptive branch names (e.g., `feature/voting-system`, `fix/auth-bug`)
3. **Develop and test** - Thoroughly test changes locally before creating a PR
4. **Submit pull requests** - Provide clear descriptions of changes and their purpose
5. **Code review** - Another team member must review and approve before merging
6. **Verify functionality** - Ensure the PR passes all checks and doesn't break existing features
7. **Merge to main** - Only merge after approval and successful testing

### Development Workflow

```bash
# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "Description of your changes"

# Push to remote
git push origin feature/your-feature-name

# Create a pull request on GitHub
# Wait for review and approval
# Merge to main after approval
```

### Code Quality Guidelines

- Follow existing code style and conventions
- Write clear, self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable and function names
- Validate all user inputs
- Handle errors gracefully
- Test edge cases

## Documentation

- **[API Documentation](./api-doc.md)** - Complete REST API reference with all endpoints, request/response formats
- **[Database Schema](./database-structure.md)** - Full database structure with relationships and constraints
- **README.md** - This file, project overview and setup instructions

## License

This project is developed as part of CS 432: Web Programming coursework.

## Acknowledgments

- **Course**: CS 432 - Web Programming
- **Institution**: Montana State University
- **Semester**: Fall 2025
- **Team Members**: Taewon Kwon, Benji Kiblinger, Michael White, Jeffery Lin

---

Built with React, Express, MongoDB, and following Robert's Rules of Order for parliamentary procedure.
