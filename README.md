# CS 432: Web Programming
## Final Project
> This repository is for the CS 432: Web Programming Final Project.

This project belongs to the group consisting of:
- Taewon Kwon
- Benji Kiblinger
- Michael White
- Jeffery Lin

## Project Overview

**Commie** is a web-based motion management and voting platform designed for HOAs: namely to be used for community governance and decision-making. The application allows users to create, view, and vote on motions in a democratic manner, following Robert's Rules of Order.

### Purpose

The primary goal of this project is to provide a digital platform for HOAs which follows Robert's Rules of Order.

As such, users can:
- Submit and discuss motions
- Vote on proposals
- Track voting history and results
- Manage user profiles and settings
- Receive notifications about motion updates

## Tech Stack

- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.6
- **Routing**: React Router DOM 7.9.1
- **Database**: MongoDB 6.20.0
- **Code Quality**: ESLint with React plugins
- **Styling**: Custom CSS

## Project Structure

```
csci432-web-dev-final-project/
├── src/
│   ├── components/          # React components
│   ├── services/            # API and service layers
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Application entry point
│   ├── App.css              # App-specific styles
│   ├── index.css            # Global styles
│   └── style.css            # Additional styling
├── public/                  # Static assets
├── index.html               # HTML entry point
├── package.json             # Project dependencies and scripts
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint configuration
└── README.md                # This file
```

## Features

### Current Features
- **Motion Management**: Create and view community motions
- **User Authentication**: Login and user session management
- **User Profiles**: View and manage user information
- **Responsive Navigation**: Easy-to-use navigation bar
- **Motion Details**: View full descriptions and voting results

### Planned Features
- Role control
- User management, including the ability to designate a "chair"
- Voting on motions
- Motion categories and filtering
- Secondary motions 
- User roles and permissions
- Viewing motion history
- ...

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- `npm` package manager
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/benjikib/csci432-web-dev-final-project.git
cd csci432-web-dev-final-project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

### Available Scripts

- `npm run dev` - Start the Vite development server
- `npm run build` - Build the project for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build locally

## Development

### Code Style
This project uses ESLint for maintaining code quality. The configuration includes:
- React-specific rules
- React Hooks linting
- React Refresh support for fast development

### Routing Structure
The application uses React Router with the following routes:
- `/` - Main landing page
- `/login` - User authentication
- `/motions` - Browse all motions
- `/motiondetails/:id` - View specific motion details
- `/profile` - User profile page
- `/settings` - Application settings

## Contributing

All group members should:
1. Avoid pushing directly to master/main
2. Create a feature branch for new work
3. Develop and commit on said branch
4. Test the new changes for functionality before making a PR
5. Submit a pull request, and have another member review it
6. Once reviewed for functionality and adherance to best practices, merge the branch to main

## Tasks 
**The current state of the project, and tasks left unfinished can be found [here]().
