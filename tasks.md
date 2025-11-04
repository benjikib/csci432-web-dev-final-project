---
  Final Project Status - Commie (Robert's Rules of Order Platform)

  ✅ COMPLETED FEATURES

  User Interface & Navigation

  - ✅ Landing page with branding and integrated authentication UI
  - ✅ Header navigation (HeaderNav component) with logo, search bar, and theme toggle
  - ✅ Sidebar navigation with active route highlighting and Material Symbols icons
  - ✅ Responsive sidebar with dark green icon section and light green contextual section
  - ✅ Context-aware sidebar (shows back navigation, committee settings when appropriate)
  - ✅ NavigationContext for navigation blocking/confirmation
  - ✅ Login/signup form UI (email, password, name, community code fields)
  - ✅ Settings page with state management (display name, theme toggle, notifications)
  - ✅ Profile page layout (mostly commented out but structure exists)
  - ✅ NotFound page (404 handling)
  - ✅ Dark mode support with ThemeContext

  Committee Management UI

  - ✅ Committees listing page (CommitteesPage.jsx) with committee cards
  - ✅ Committee details/motions view (CommitteeMotionsPage.jsx)
  - ✅ Committee settings page (CommitteeSettingsPage.jsx)
  - ✅ Mock committee data storage (CommitteeStorage.jsx)
  - ✅ Tabbed interface for motions (All, Active, Past, Voided)
  - ✅ Committee-specific routing (/committee/:id)

  Motion Management UI

  - ✅ Motion list view by committee
  - ✅ Motion card component (MotionCard.jsx) with title, description, and vote count
  - ✅ Motion details modal with tabbed interface (Description, Comments, Voting tabs)
  - ✅ Proper URL routing for motion details (/committee/:committeeId/motion/:motionId)
  - ✅ Modal overlay with backdrop blur effect
  - ✅ Click anywhere on card to open details
  - ✅ Motion comments UI (MotionDetailsComments.jsx) - placeholder only
  - ✅ Mock motion data organized by committee

  Tech Stack Compliance

  - ✅ React 19 for frontend
  - ✅ Vite build tool configured
  - ✅ Tailwind CSS 4.1.13 implemented
  - ✅ Auth0 integration configured (domain and clientId set up)
  - ✅ Material Symbols icons for UI
  - ✅ MongoDB connection string configured (not actively used)
  - ✅ No WebSocket (compliant)
  - ✅ No web-based live audio/video (compliant)

  Development Infrastructure

  - ✅ Git repository with proper branching strategy
  - ✅ ESLint configuration for code quality
  - ✅ Feature branch workflow with pull requests
  - ✅ React Router v7 for navigation
  - ✅ Context API for theme and navigation state

  ---
  ❌ REQUIRED FEATURES - NOT IMPLEMENTED

  User Authentication & Registration

  - ⚠️ Auth0 configured but not fully integrated - Login navigates to /committees without proper auth flow
  - ❌ Actual user registration backend - No database storage of users
  - ❌ Password hashing and storage - Auth0 handles this, but not connected to backend
  - ❌ Session management - No backend session validation
  - ❌ Login validation - Frontend uses Auth0 but backend doesn't verify
  - ❌ Name change functionality - No user profile editing backend
  - ❌ Optional features: Short bio, phone number, address, profile picture editing

  Committee Management

  - ❌ Creating a committee - No committee creation UI or backend endpoint
  - ❌ Adding users to a committee - No user management system
  - ⚠️ Committee listing/selection - UI exists (CommitteesPage) but uses mock data only
  - ⚠️ Committee settings page - Page exists but no actual settings functionality
  - ❌ Committee deletion/editing - No management functionality
  - ❌ Committee membership tracking - Mock data only

  Role Control

  - ❌ Role assignment - No owner, chair, member, observer roles implemented
  - ❌ Role-based authentication - All routes accessible to everyone
  - ❌ Permission enforcement - No restrictions on who can create motions, vote, etc.
  - ❌ Fine-grained authentication control (optional) - Not implemented
  - ❌ User control panel - Route exists (/user-control) but page not created

  Chair Control Panel 

  - ❌ Control panel UI - No chair-specific interface
  - ❌ Toggle offline version - No meeting mode switching
  - ❌ Set discussion requirements - No rules for # of speakers before vote
  - ❌ Other procedural controls - No Robert's Rules enforcement options

  Motion Creation & Management

  - ❌ Raise motion - No motion creation UI or backend endpoint (route exists: /committee/:id/create-motion)
  - ❌ Motion title and description input - No form implemented
  - ❌ Edit existing motions - No editing capability
  - ❌ Delete/withdraw motions - No removal functionality
  - ⚠️ Motion status tracking - Tabs exist (All, Active, Past, Voided) but no actual status logic
  - ⚠️ Motion display - UI works with mock data organized by committee
  - ❌ Motion persistence - All data is mock/local, lost on refresh

  Procedural Motions 

  - ❌ Motions to change procedure - No special motion types
  - ❌ 2/3 vote requirement enforcement - No voting threshold logic
  - ❌ Motion type categorization - No distinction between motion types

  Discussion Features

  - ❌ Offline discussion implementation
    - ❌ Comments/replies on motions - No backend storage
    - ❌ Pro/con/neutral selection for each reply
    - ❌ Discussion threading
  - ⚠️ Current State: Comments tab exists in motion details modal (MotionDetailsComments.jsx) but displays "No comments yet" placeholder only

  Voting System

  - ⚠️ Voting UI exists in motion details modal but non-functional
  - ❌ Actual voting functionality - Buttons exist but don't record votes
  - ❌ Vote recording - No database storage of votes
  - ❌ Vote counting - No tallying of yes/no/abstain
  - ❌ Anonymous vs. recorded voting options - No voting mode selection
  - ❌ Vote results display - Mock vote counts shown but no real calculation
  - ❌ Voting threshold enforcement (majority, 2/3, unanimous)
  - ❌ Prevent duplicate voting - No vote tracking per user

  Decision Recording & History

  - ❌ Recording of previous decisions - No history database
  - ❌ Full discussion recording - No comment/discussion storage
  - ❌ Chair summary of decisions - No summary writing feature
  - ❌ Pros/cons recording - No structured decision documentation
  - ❌ Future reference/search - No archived decisions searchable
  - ❌ Motions history page - Route exists (/motions-history) but not implemented

  Overturning Decisions

  - ❌ Motion to overturn - No "reconsider" motion type
  - ❌ Voter verification - No check for "who voted in favor"
  - ❌ Restriction enforcement - Only original supporters can move to overturn

  Sub-Motions & Amendments

  - ❌ Revision motions - No amendment system
  - ❌ Postpone motion - No delay/table functionality
  - ❌ Sub-motion hierarchy - No nested motion structure
  - ❌ Amendment voting - No separate vote on changes before main motion

  Special Motions

  - ❌ Non-debatable motions - No motion type enforcement
  - ❌ Cannot-be-discussed motions - No procedural motion handling
  - ❌ Privileged motions - No recess, adjourn, point of order, etc.

  Backend & Database

  - ❌ Node.js backend server - No Express/Fastify server created
  - ❌ API endpoints - No REST API exists
  - ❌ Database models - No MongoDB schemas defined
  - ❌ Database operations - MongoDB connection exists but unused
  - ❌ Data persistence - All data is mock/local, lost on refresh
  - ❌ API security - No JWT, CORS, rate limiting

  Additional Features

  - ⚠️ Search functionality - Search bar exists in header with state management, but no actual filtering implemented
  - ❌ Notification system - No implementation
  - ❌ Quorum tracking - No meeting attendance system
  - ❌ Meeting minutes - No official record generation
  - ❌ Export/print decisions - No document generation
  - ❌ User control panel - Route exists (/user-control) in sidebar but page not created

  ---

  🔧 IMMEDIATE PRIORITIES

  High Priority (Core Functionality)

  1. Create backend API server (Node.js + Express)
     - Set up basic Express server
     - Connect to MongoDB
     - Create API endpoints for CRUD operations

  2. Implement Committee Creation
     - Create UI form for committee creation
     - Backend endpoint to save committees
     - Link to existing CommitteesPage display

  3. Implement Motion Creation
     - Create UI form for motion creation
     - Backend endpoint to save motions
     - Link to existing CommitteeMotionsPage display

  4. Basic Voting System
     - Backend to record votes per user per motion
     - Update vote counts in real-time
     - Prevent duplicate voting

  5. User Authentication Backend
     - Verify Auth0 tokens on backend
     - Create user profiles in database
     - Session management

  Medium Priority (Enhanced Functionality)

  6. Comments/Discussion System
     - Comment creation and storage
     - Display comments in MotionDetailsComments
     - Basic threading support

  7. Role-Based Access Control
     - Implement basic roles (owner, chair, member, observer)
     - Protect routes based on roles
     - Committee membership management

  8. Motion Status Management
     - Implement status workflow (active → voting → passed/failed)
     - Filter motions by status (make tabs functional)

  Low Priority (Nice to Have)

  9. Search Implementation
     - Connect existing search bar to actual filtering
     - Search across committees and motions

  10. Advanced Robert's Rules Features
      - Procedural motions
      - Amendments and sub-motions
      - Meeting mode controls

  ---

  📁 CURRENT PROJECT STRUCTURE

  Frontend Components (src/components/)
  - ✅ MainPage.jsx - Landing/login page
  - ✅ CommitteesPage.jsx - List all committees
  - ✅ CommitteeMotionsPage.jsx - List motions for a committee
  - ✅ CommitteeSettingsPage.jsx - Committee settings (placeholder)
  - ✅ MotionCard.jsx - Motion card component
  - ✅ MotionDetailsPage.jsx - Motion details modal
  - ✅ MotionDetailsComments.jsx - Comments tab (placeholder)
  - ✅ SettingsPage.jsx - User settings
  - ✅ ProfilePage.jsx - User profile (mostly commented)
  - ✅ LoginPage.jsx - Standalone login page
  - ✅ NotFoundPage.jsx - 404 page
  - ✅ CommitteeStorage.jsx - Mock data storage
  - ✅ reusable/SideBar.jsx - Navigation sidebar
  - ✅ reusable/HeaderNav.jsx - Header navigation
  - ✅ reusable/Tabs.jsx - Tabbed interface component

  Context Providers (src/context/)
  - ✅ ThemeContext.jsx - Dark mode state management
  - ✅ NavigationContext.jsx - Navigation blocking/confirmation

  Routing
  - / → MainPage (landing/login)
  - /committees → CommitteesPage
  - /committee/:id → CommitteeMotionsPage
  - /committee/:id/settings → CommitteeSettingsPage
  - /committee/:committeeId/motion/:motionId → MotionDetailsPage (modal)
  - /settings → SettingsPage
  - /profile → ProfilePage
  - /login → LoginPage
  - * → NotFoundPage

  Missing/Needed Files
  - ❌ Backend server (no server/ directory)
  - ❌ API routes
  - ❌ Database models
  - ❌ CreateCommitteePage.jsx
  - ❌ CreateMotionPage.jsx
  - ❌ UserControlPage.jsx

  ---
