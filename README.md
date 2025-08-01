# Firebase AIoT Device Manager

A real-time AIoT (Artificial Intelligence of Things) device management application built with Firebase, Vite, and Tailwind CSS.

## 🌟 Features

### Authentication
- Email/Password Authentication
- Google OAuth Sign-in
- Real-time Auth State Management
- User session persistence

### Device Management
- **Real-time Device Monitoring**: Live status updates across all connected sessions
- **Device CRUD Operations**: Add, update, and delete AIoT devices
- **Status Management**: Toggle between online/offline/error states
- **Device Filtering**: View all devices, or filter by online/offline status
- **Batch Operations**: Clear all offline devices at once
- **Device Statistics**: Real-time counters for online/offline devices

### Device Types Supported
- 🌡️ **Sensors**: Temperature, humidity, motion, light sensors
- ⚙️ **Actuators**: Motors, switches, valves, servo motors
- 🌐 **Gateways**: Communication hubs, protocol converters
- 📹 **Cameras**: Video surveillance, monitoring devices

### UI/UX Features
- Responsive design for mobile and desktop
- Korean language interface
- Real-time animations and transitions
- Empty state management
- Loading states and error handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd firebase-auth-sample-working
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Firebase Console Setup**
   - Enable Authentication (Email/Password and Google providers)
   - Enable Firestore Database
   - Set up Firestore security rules for user data isolation

5. **Start development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5173` to see the application.

## 🏗️ Build & Deploy

### Local Build
```bash
npm run build
npm run preview
```

### AWS Amplify Deployment
This project includes AWS Amplify configuration (`amplify.yml`):
```bash
# Amplify will automatically use the amplify.yml configuration
# when connected to your repository
```

## 📁 Project Structure

```
firebase-auth-sample-working/
├── src/
│   ├── app.js                 # Main application logic
│   └── config/
│       └── firebase.config.js # Firebase configuration
├── styles/
│   └── style.css             # Custom styles
├── index.html                # Entry point
├── vite.config.js           # Vite configuration
├── amplify.yml              # AWS Amplify config
├── CLAUDE.md                # Development guidance
└── package.json             # Dependencies
```

## 🔧 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Firebase (Authentication + Firestore)
- **Deployment**: AWS Amplify
- **Real-time**: Firestore onSnapshot listeners

## 📱 Usage

1. **Authentication**: Sign up or log in using email/password or Google OAuth
2. **Add Devices**: Enter device name, select type, and specify location
3. **Monitor Status**: View real-time device status updates
4. **Manage Devices**: Toggle status between online/offline/error states
5. **Filter View**: Use filter buttons to view specific device states
6. **Batch Actions**: Clear all offline devices with one click

## 🔒 Security Features

- User data isolation (each user sees only their devices)
- XSS protection with HTML escaping
- Firebase security rules for data access control
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

