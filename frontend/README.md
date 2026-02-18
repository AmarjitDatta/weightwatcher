# Weight Tracker Frontend

React-based single-page application for the Weight Tracker, featuring user authentication and weight management.

## Overview

A modern, responsive web application that provides a complete user experience for tracking weight over time. Built with React 18 and React Router, it features secure authentication, protected routes, and real-time weight tracking.

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **Charts**: Chart.js 4 with react-chartjs-2
- **Styling**: CSS3 with responsive design
- **Server**: Nginx (production)
- **State Management**: React Hooks (useState, useEffect)
- **Storage**: localStorage for session persistence

## Features

### Authentication
- ✅ **User Registration** - New user signup with validation
- ✅ **User Login** - Email/password authentication
- ✅ **Session Persistence** - Stay logged in across browser sessions
- ✅ **Protected Routes** - Automatic redirect to login when not authenticated
- ✅ **Logout** - Clear session and return to login

### Weight Tracking
- ✅ **View History** - See all weight entries in a table
- ✅ **Progress Chart** - Interactive time series line chart visualizing weight over time
- ✅ **Add Entry** - Quick form to add new weight
- ✅ **Inline Edit** - Edit entries directly in the table
- ✅ **Delete Entry** - Remove entries with confirmation
- ✅ **Auto-Refresh** - List and chart update automatically after changes
- ✅ **Real-time Feedback** - Success/error messages for all actions

### User Experience
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Clean UI** - Modern, intuitive interface
- ✅ **Form Validation** - Client-side validation before submission
- ✅ **Loading States** - Visual feedback during operations

## Pages

### Login Page (`/login`)
- Email and password authentication
- Link to registration page
- Error messages for invalid credentials
- Auto-redirect to tracker on success

### Register Page (`/register`)
- Full name, email, and password fields
- Password confirmation
- Client-side validation (min 6 characters, matching passwords)
- Success message with auto-redirect to login

### Weight Tracker (`/tracker`)
- Protected route (login required)
- Welcome message with user's name
- Add new weight entry form
- **Interactive time series chart** - Visual representation of weight progress over time
  - Date-based X-axis with automatic formatting
  - Weight (lb) on Y-axis with auto-scaling
  - Smooth line connecting data points
  - Hover tooltips showing exact values
  - Responsive design that adapts to screen size
- Weight history table with inline editing
- Edit and delete actions for each entry
- Logout button

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Login.js          # Login page component
│   │   ├── Register.js       # Registration page component
│   │   └── WeightTracker.js  # Main weight tracking component
│   ├── App.js                # Main app with routing
│   ├── App.css               # Global styles
│   ├── index.js              # Entry point
│   └── index.css             # Base styles
├── package.json
├── Dockerfile
└── nginx.conf                # Nginx configuration
```

## Environment Variables

- `REACT_APP_API_URL`: Weight API URL (default: `http://localhost:8000`)
- `REACT_APP_USER_API_URL`: User API URL (default: `http://localhost:8001`)

## Running Locally

### With Docker (Recommended)

From the project root:
```bash
docker-compose up -d frontend
```

Access at: http://localhost:3000

### Without Docker

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set environment variables (optional):
```bash
export REACT_APP_API_URL=http://localhost:8000
export REACT_APP_USER_API_URL=http://localhost:8001
```

3. Start development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

## API Integration

### User API (Port 8001)
- `POST /users` - Register new user
- `POST /login` - Authenticate user
- `GET /users/{id}` - Get user details

### Weight API (Port 8000)
- `GET /weights?userId={id}` - Get user's weight entries
- `POST /weights` - Add new weight entry
- `PUT /weights?userId={id}&weightId={id}` - Update entry
- `DELETE /weights?userId={id}&weightId={id}` - Delete entry

## User Flow

1. **First Time User**
   - Visit `/` → Redirected to `/login`
   - Click "Register here" → Go to `/register`
   - Fill registration form → Submit
   - See success message → Auto-redirect to `/login`
   - Enter credentials → Login successful
   - Redirected to `/tracker`

2. **Returning User**
   - Visit `/` → If session exists, go to `/tracker`, else `/login`
   - Enter credentials → Login
   - Access weight tracker

3. **Weight Management**
   - View existing entries in table
   - Add new entry via form at top
   - Edit entry: Click "Edit" → Modify inline → Click "Save" or "Cancel"
   - Delete entry: Click "Delete" → Confirm → Entry removed
   - Logout: Click "Logout" → Session cleared → Return to login

## State Management

### User State
Stored in:
- React state (`user` object)
- localStorage (`user` JSON)

Contains:
```javascript
{
  userId: 1000,
  fullName: "John Doe",
  email: "john@example.com"
}
```

### Weight Data
- Fetched from API on component mount
- Refreshed after add/update/delete operations
- Displayed in table with latest entries

## Styling

Custom CSS with:
- **Color Scheme**: Purple gradient for auth pages, dark header for app
- **Responsive Breakpoints**: Mobile-first design with 768px breakpoint
- **Components**: Buttons, forms, tables, alerts, cards
- **States**: Hover, focus, disabled states
- **Animations**: Smooth transitions on interactive elements

## Security

- **Password Handling**: Never stored in frontend, only sent to API
- **Session Storage**: Only userId, name, and email stored (no sensitive data)
- **Protected Routes**: Redirect to login if not authenticated
- **CORS**: Configured in backend APIs

## Troubleshooting

**Can't login after registration:**
- Wait 2 seconds for auto-redirect
- Ensure you're using the correct email and password
- Check backend logs: `docker-compose logs user-api`

**Weight entries not loading:**
- Check if logged in (userId should be set)
- Verify Weight API is running: `curl http://localhost:8000/health`
- Check browser console for errors

**Page not found (404):**
- Ensure all routes are properly configured
- Check nginx.conf has `try_files $uri $uri/ /index.html`

**Frontend not connecting to APIs:**
- Verify REACT_APP_API_URL and REACT_APP_USER_API_URL
- Check CORS is enabled in backend APIs
- Inspect Network tab in browser DevTools

## Development

### Adding a New Page

1. Create component in `src/components/`
2. Import in `App.js`
3. Add route in `<Routes>` section
4. Update navigation/links

### Modifying Styles

- Global styles: `App.css`
- Component-specific: Add classes and define in `App.css`
- Responsive: Use media query at bottom of `App.css`

### Testing

```bash
# Run tests
npm test

# Build production
npm run build

# Check for errors
npm run build 2>&1 | grep -i error
```

## Docker

### Dockerfile
Multi-stage build:
1. **Build stage**: Node.js Alpine - install deps, build React app
2. **Production stage**: Nginx Alpine - serve static files

### nginx.conf
- Serves React app from `/usr/share/nginx/html`
- Handles React Router (all routes → index.html)
- Optional API proxy at `/api` (currently not used, direct API calls)

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari, Chrome Mobile

## Performance

- Production build minified and optimized
- Code splitting for routes (if needed)
- Static assets cached by Nginx
- Lightweight (~500KB total bundle)

## Future Enhancements

- [ ] Remember me checkbox
- [ ] Forgot password functionality
- [ ] Email verification
- [ ] Profile editing
- [ ] Weight charts/graphs
- [ ] Goal setting
- [ ] Export data to CSV
- [ ] Dark mode toggle
