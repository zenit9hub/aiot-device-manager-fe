# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Vite development server on port 5173
- `npm run build` - Build production bundle to `dist/` directory  
- `npm run preview` - Preview production build locally

## Project Architecture

This is a Firebase **AIoT Device Manager** application built with vanilla JavaScript, Vite, Firebase Authentication, and Firestore. The architecture follows a client-side pattern with real-time data synchronization for IoT device management.

### Core Files
- `src/app.js` - Main application logic with Firebase auth and Firestore device operations
- `src/config/firebase.config.js` - Firebase configuration using Vite environment variables
- `index.html` - Entry point with authentication and device management UI components
- `vite.config.js` - Vite bundler configuration
- `styles/style.css` - Custom styles for device management interface

### Authentication & Data Flow
The app implements Firebase v9+ modular SDK with:
- **Authentication**: Email/password and Google OAuth authentication
- **Real-time Data**: Firestore `onSnapshot` listeners for real-time device synchronization
- **User Isolation**: Each user's devices are stored with their `userId` for data isolation
- **State Management**: Global variables track current user, devices, and UI filter state

### Firestore Data Structure
```
devices/ (collection)
  ├── {deviceId}/ (document)
      ├── name: string
      ├── type: string (sensor, actuator, gateway, camera)
      ├── status: string (online, offline, error)
      ├── location: string
      ├── batteryLevel: number (0-100)
      ├── lastSeen: timestamp
      ├── userId: string
      └── createdAt: timestamp
```

### AIoT Device Features
- **CRUD Operations**: Add, update status, delete devices
- **Real-time Sync**: All users see their devices update in real-time across sessions
- **Device Filtering**: View all, online, or offline devices
- **Device Status Management**: Toggle between online/offline/error states
- **Batch Operations**: Clear all offline devices at once
- **Device Monitoring**: Track battery levels, last seen timestamps, locations
- **User-specific Data**: Each user only sees their own devices

### UI State Management
- Authentication section is hidden when user is logged in
- Device management section is shown only for authenticated users
- Real-time listeners are set up/torn down based on auth state
- Filter buttons update active state and re-render device list
- Device statistics (online/offline counts) update automatically

### Device Types and Features
- **Sensors**: Temperature, humidity, motion sensors, etc.
- **Actuators**: Motors, switches, valves, etc.
- **Gateways**: Central communication hubs
- **Cameras**: Video surveillance devices

### Environment Configuration
Firebase config requires both Authentication and Firestore:
- Copy `.env.example` to `.env` and populate with Firebase project credentials
- Ensure Firestore is enabled in Firebase Console
- Set up Authentication providers (Email/Password, Google) in Firebase Console

## Key Implementation Notes

- All Firestore operations use async/await with error handling
- Real-time listeners are properly cleaned up on auth state changes
- Device rendering uses string templates with event handlers and animations
- Global functions are exposed on `window` object for inline event handlers
- Korean UI text for better user experience
- Tailwind CSS with custom styles for device-specific components
- XSS protection with HTML escaping for user input
- Responsive design for mobile and desktop usage
- AWS Amplify deployment configuration included (`amplify.yml`)