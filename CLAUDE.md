# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Vite development server on port 5173
- `npm run build` - Build production bundle to `dist/` directory  
- `npm run preview` - Preview production build locally

## Project Architecture

This is a Firebase Todo application built with vanilla JavaScript, Vite, Firebase Authentication, and Firestore. The architecture follows a client-side pattern with real-time data synchronization.

### Core Files
- `src/app.js` - Main application logic with Firebase auth and Firestore operations
- `src/config/firebase.config.js` - Firebase configuration using Vite environment variables
- `index.html` - Entry point with authentication and todo UI components
- `vite.config.js` - Vite bundler configuration

### Authentication & Data Flow
The app implements Firebase v9+ modular SDK with:
- **Authentication**: Email/password and Google OAuth authentication
- **Real-time Data**: Firestore `onSnapshot` listeners for real-time todo synchronization
- **User Isolation**: Each user's todos are stored with their `userId` for data isolation
- **State Management**: Global variables track current user, todos, and UI filter state

### Firestore Data Structure
```
todos/ (collection)
  ├── {todoId}/ (document)
      ├── text: string
      ├── completed: boolean
      ├── userId: string
      └── createdAt: timestamp
```

### Todo Features
- **CRUD Operations**: Add, update completion status, delete todos
- **Real-time Sync**: All users see their todos update in real-time across devices
- **Filtering**: View all, active, or completed todos
- **Batch Operations**: Clear all completed todos at once
- **User-specific Data**: Each user only sees their own todos

### UI State Management
- Authentication section is hidden when user is logged in
- Todo section is shown only for authenticated users
- Real-time listeners are set up/torn down based on auth state
- Filter buttons update active state and re-render todo list

### Environment Configuration
Firebase config requires both Authentication and Firestore:
- Copy `.env.example` to `.env` and populate with Firebase project credentials
- Ensure Firestore is enabled in Firebase Console
- Set up Authentication providers (Email/Password, Google) in Firebase Console

## Key Implementation Notes

- All Firestore operations use async/await with error handling
- Real-time listeners are properly cleaned up on auth state changes
- Todo rendering uses string templates with event handlers
- Global functions are exposed on `window` object for inline event handlers
- Korean UI text for better user experience
- Tailwind CSS with custom styles for todo-specific components