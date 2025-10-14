# Golden Hour Calculator

A beautiful, responsive web application for calculating golden hour times for photography and cinematography. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

### 🌅 Golden Hour Calculations

- **Morning Golden Hour**: Perfect soft, warm light after sunrise
- **Evening Golden Hour**: Rich, directional light before sunset
- **Sunrise & Sunset Times**: Complete daily light schedule
- **Two Calculation Modes**:
  - **±6°**: Sun between -6° and +6° altitude (more precise)
  - **SunCalc**: Built-in SunCalc.js algorithm

### 🌍 Location & Time Management

- **Smart City Search**: Search from thousands of cities worldwide with debounced input
- **Geolocation**: One-click auto-detection of current location
- **Location Memory**: Automatically remembers your last selected city
- **Date Navigation**: Browse past and future dates with arrow controls
- **Smart Today Button**: Appears only when needed, returns to current date
- **Adaptive Layout**: Clean spacing that adjusts based on content

### ⏱️ Real-time Information

- **Live Countdowns**: Shows time remaining until each event ("in 2:30 hours")
- **Active Golden Hour Banner**: Prominent alert when golden hour is happening now
- **Remaining Time Display**: Shows exactly how much golden hour time is left
- **Smart Past Events**: Shows "hours ago" only for today's past events
- **Auto-refresh**: Updates every minute for accurate timing

### 🎨 User Experience

- **Responsive Design**: Seamless experience on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes with golden/orange accent colors
- **Smooth Animations**: Fade-in effects and hover transitions
- **Visual Timeline**: Interactive graphical representation of daylight hours
- **Dropdown Positioning**: Location search always expands downward
- **No Layout Shifts**: Stable interface with conditional spacing

### 🛠️ Developer Features

- **Dev Mode**: Hidden development tools for testing
- **Test Banner**: Preview golden hour banner without waiting
- **URL Parameters**: Access dev features with `?dev=1`
- **Error Handling**: Graceful fallbacks for all edge cases

## Technology Stack

- **React 19** with TypeScript
- **SunCalc.js** for astronomical calculations
- **Tailwind CSS** for styling
- **React Window** for efficient city list virtualization
- **LocalStorage** for preferences persistence

## File Structure

```
src/golden_hour/
├── README.md          # This file
├── App.tsx           # Main application component
├── index.html        # HTML template
├── index.css         # Tailwind CSS styles
└── main.tsx          # React entry point
```

## Key Components

### `App.tsx`

Main application component containing:

- City search and selection
- Date picker with navigation
- Golden hour calculations
- Real-time banner notifications
- Responsive layout

### Golden Hour Banner

- Appears when golden hour is active
- Shows start/end times and remaining duration
- Different styles for morning vs evening
- Test mode available for development

### City Search

- Debounced search for performance
- Virtualized list for thousands of cities
- Supports city name and timezone search
- Geolocation integration

### Time Calculations

- Binary search algorithm for precise sun altitude timing
- Support for both ±6° and SunCalc modes
- Real-time countdown calculations
- Smart date handling

## Development Features

### Active Golden Hour Detection

- **Real-time Detection**: Automatically detects when golden hour is happening
- **Prominent Banner**: Eye-catching alert with golden gradient background
- **Time Information**: Shows start time, end time, and remaining duration
- **Smart Display**: Only appears when viewing today's date during active golden hour

### Development Tools

Access development features by:

- Running on `localhost` (automatic), or
- Adding `?dev=1` to any URL (manual)

**Dev Mode Button**: Located in footer next to "Powered by" text

- Toggle test banner on/off
- Preview golden hour banner without waiting
- Test different UI states

### Error Handling & Reliability

- **Graceful Fallbacks**: Missing data doesn't break the app
- **User-friendly Messages**: Clear error states and loading indicators
- **Console Warnings**: Helpful debugging information for developers
- **Offline Resilience**: Works with cached city data
- **LocalStorage Safety**: Handles storage errors gracefully

## 🚀 Usage Guide

### Getting Started

1. **First Visit**: The app loads with an empty location selector
2. **Choose Location**:
   - 🔍 **Search**: Type city name or timezone
   - 📍 **Geolocation**: Click the location icon for auto-detection
   - 💾 **Return Visits**: Your last city loads automatically

### Navigation

3. **Select Date**:
   - 📅 **Today**: Default view shows current date
   - ⬅️➡️ **Browse**: Use arrow buttons to navigate dates
   - 🏠 **Quick Return**: "Today" button appears when viewing other dates

### Information Display

4. **View Golden Hours**:
   - 🌅 **Morning**: Soft, warm light period
   - 🌇 **Evening**: Rich, directional light period
   - ⏰ **Countdowns**: See exactly when each event occurs
   - 🔴 **Live Banner**: Get alerted during active golden hours

### Planning Your Shoot

5. **Use the Data**:
   - 📊 **Visual Timeline**: See the entire day's light schedule
   - ⏱️ **Real-time Updates**: Countdowns update every minute
   - 🎯 **Precise Timing**: Plan arrivals and setups in advance

## Calculations

### ±6° Mode (Default)

- **Morning Start**: Sun at -6° altitude (civil dawn)
- **Morning End**: Sun at +6° altitude
- **Evening Start**: Sun at +6° altitude
- **Evening End**: Sun at -6° altitude (civil dusk)

### SunCalc Mode

- Uses SunCalc.js built-in golden hour definitions
- **Morning**: Sunrise to goldenHourEnd
- **Evening**: goldenHour to sunset

## Browser Support

- Modern browsers with ES2017+ support
- JavaScript required
- LocalStorage for preferences (optional)
- Geolocation API for auto-location (optional)

## Data Sources

- **City Database**: GeoNames cities15000 dataset
- **Astronomical Calculations**: SunCalc.js library
- **Timezones**: IANA timezone database

## 🆕 What's New

### Recent Updates

- **🎯 Active Golden Hour Banner**: Real-time notifications when golden hour is happening
- **⏰ Remaining Time Display**: Shows exactly how much golden hour time is left
- **💾 Location Memory**: Automatically saves and restores your preferred city
- **🎨 Smart Layout**: No layout shifts, conditional spacing for clean interface
- **🧪 Dev Mode**: Hidden development tools for testing and debugging
- **📱 Enhanced Mobile**: Better responsive design with improved touch targets
- **🔄 Smarter Countdowns**: Only shows "hours ago" for today's past events

### Interface Improvements

- **Dropdown Positioning**: Location search always expands downward
- **Today Button Logic**: Appears only when needed, saves space when not
- **Real-time Updates**: All timers and countdowns update every minute
- **Error Resilience**: Better handling of edge cases and missing data

## ⚡ Performance & Technical Details

### Optimization Features

- **Virtualized Lists**: Smooth scrolling through thousands of cities
- **Debounced Search**: 200ms delay reduces unnecessary API calls
- **Efficient Rendering**: React hooks minimize unnecessary re-renders
- **Smart Caching**: LocalStorage persists user preferences
- **Minimal Bundle**: Tree-shaking eliminates unused code

### Browser Compatibility

- **Modern Standards**: ES2017+ support required
- **Progressive Enhancement**: Core features work without optional APIs
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Memory Management

- **Cleanup Timers**: All intervals properly cleared on unmount
- **Event Listeners**: Added and removed correctly to prevent leaks
- **Efficient Updates**: Only re-calculate when location, date, or mode changes

---

Perfect for photographers, cinematographers, and anyone who loves capturing beautiful natural light! 📸✨

## 🎯 Perfect For

- **📷 Photographers**: Plan the perfect lighting for portraits and landscapes
- **🎬 Cinematographers**: Schedule shoots for optimal cinematic lighting
- **🌅 Golden Hour Enthusiasts**: Never miss another magical moment
- **📱 Mobile Users**: Full functionality on any device, anywhere
