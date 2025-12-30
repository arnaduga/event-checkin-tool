# Event Check-in Application

A simple web application for managing participant check-ins at events.

## Features

- **Excel Import**: Upload participant lists from Excel files (.xlsx)
- **Quick Search**: Search participants by name or email
- **QR Code Support**: Search by email (for QR code encoded emails)
- **Sortable Table**: Sort participants by any column
- **Check-in/Check-out**: Toggle participant check-in status
- **Manual Addition**: Add participants who aren't pre-registered
- **Local Storage**: Data persists across page refreshes
- **Statistics Dashboard**: View real-time check-in statistics

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Uploading Participant List

1. Click on the file upload area
2. Select an Excel file (.xlsx) with participant data
3. The file should have columns for:
   - First Name (Prénom, First Name, Prenom, or prénom)
   - Last Name (Nom, Last Name, or nom)
   - Email (Email or email)

### Checking In Participants

1. Use the search bar to find participants by name or email
2. Click the "Check In" button next to their name
3. The status will update to "Checked In" with a timestamp

### Adding Participants Manually

1. Click "Add Participant" button
2. Fill in the participant details
3. Click "Add" to save
4. The participant will be automatically checked in

### Searching with QR Codes

If participant emails are encoded in QR codes:
1. Scan the QR code with a QR reader
2. Copy the email address
3. Paste it into the search field
4. The participant will be filtered and displayed

## Technical Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Cloudscape Design System** - UI components
- **xlsx** - Excel file parsing
- **localStorage** - Data persistence

## Data Storage

All participant data is stored locally in the browser's localStorage. No data is sent to any server.

## License

MIT
