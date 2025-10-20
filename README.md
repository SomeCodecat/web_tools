# Web Tools

A collection of web-based tools for various utilities.

## Golden Hour Calculator

A sophisticated golden hour calculator that helps photographers and outdoor enthusiasts find the perfect lighting conditions for any location and date.

### 📱 Progressive Web App (PWA)

**Install as an app on your device!**

#### Android Installation:

1. Open Chrome/Edge on your Android device
2. Navigate to the Golden Hour Calculator
3. Tap the menu (⋮) and select "Add to Home screen" or "Install app"
4. The app will be installed and can be launched like any other app
5. **Works offline** after installation with cached data

#### iOS Installation:

1. Open Safari on your iPhone/iPad
2. Navigate to the Golden Hour Calculator
3. Tap the Share button and select "Add to Home Screen"
4. The app will appear on your home screen

#### Features when installed:

- **Standalone app experience** (no browser UI)
- **Offline functionality** with service worker caching
- **Home screen icon** with app branding
- **Faster loading** with cached resources
- **Native app feel** with splash screen

### Features

#### 🌅 Golden Hour Calculations

- **Two calculation modes:**
  - **SunCalc Mode**: Uses SunCalc.js library for precise astronomical calculations
  - **±6° Mode**: Uses the traditional ±6° sun elevation definition
- **Real-time updates** with automatic refresh based on current time
- **Dynamic favicon** that changes between sunrise 🌅 and sunset 🌇 based on next golden hour

#### 🔍 Advanced Search

- **Fuzzy search** powered by Fuse.js for intelligent city matching
- **Multi-term search**: Search "san asia" to find cities matching both terms
- **Smart scoring system**:
  - Exact city name match: 100 points (highest priority)
  - City name starts with term: 50 points
  - City name contains term: 25 points
  - Location match: 20 points
  - Region match: 15 points
  - Timezone match: 10 points (lowest priority)
- **Global coverage**: Search across 15,000+ cities worldwide
- **Regional search**: Find cities by continent (e.g., "europe", "asia", "america")

#### 🔗 URL Sharing

Share locations and dates with URL parameters:

**Location sharing:**

```
?place=San Francisco,America/Los_Angeles
?place=Tokyo,Asia/Tokyo
```

**Date sharing:**

```
?date=2024-12-25          # Specific date
?date=today               # Current date
?date=today+1             # Tomorrow
?date=today+7             # One week from today
?date=today-1             # Yesterday
```

**Combined sharing:**

```
?place=Paris,Europe/Paris&date=today+3
```

#### 💾 Persistent Preferences

- **Location memory**: Automatically remembers your last selected location
- **Calculation mode**: Saves your preferred SunCalc vs ±6° mode
- **Cross-session persistence** using localStorage

#### 📱 Responsive Design

- **Mobile-optimized** interface with touch-friendly controls
- **Dark theme** with elegant slate color scheme
- **Smooth animations** and hover effects
- **Accessibility features** with proper ARIA labels

### Technical Stack

- **React 19** with TypeScript for type safety and modern hooks
- **Tailwind CSS** for responsive styling and dark theme
- **SunCalc.js** for astronomical calculations
- **Fuse.js** for advanced fuzzy search capabilities
- **React Window** for efficient virtualized lists (15,000+ cities)
- **Service Worker** for PWA offline functionality
- **Web App Manifest** for installable app experience

### Search Examples

**Single term searches:**

- `paris` → Finds Paris, France and other Paris locations
- `tokyo` → Finds Tokyo, Japan
- `new` → Finds New York, New Delhi, Newcastle, etc.

**Multi-term searches:**

- `san america` → Finds San Francisco, San Jose, etc. in Americas
- `london europe` → Finds London, UK (excludes London, Ontario)
- `york new` → Finds New York specifically

**Regional searches:**

- `europe` → Lists all European cities
- `asia` → Lists all Asian cities
- `america` → Lists all cities in the Americas

### URL Parameters Reference

| Parameter | Format                   | Description           | Examples                      |
| --------- | ------------------------ | --------------------- | ----------------------------- |
| `place`   | `CityName,Timezone`      | Sets location         | `?place=Berlin,Europe/Berlin` |
| `date`    | `YYYY-MM-DD` or relative | Sets calculation date | `?date=2024-06-21`            |
| `date`    | `today[±N]`              | Relative date         | `?date=today+5`               |

### Development

**Build the project:**

```bash
./build.sh
```

**Start development server:**

```bash
python3 -m http.server 8080
```

**Access the application:**

- Golden Hour Calculator: `http://localhost:8080/public/golden_hour/`
- Timezones Tool: `http://localhost:8080/public/timezones/`

### PWA Development Notes

- **HTTPS required** for service workers (except localhost)
- **Manifest validation** can be checked in Chrome DevTools > Application > Manifest
- **Service worker debugging** available in Chrome DevTools > Application > Service Workers
- **Offline testing** can be simulated in Chrome DevTools > Network > Offline

### Browser Support

- Modern browsers with ES2020+ support
- Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- Mobile browsers (iOS Safari, Chrome Mobile)
- **PWA support**: Chrome, Edge, Samsung Internet, Firefox (limited)

### Data Sources

- **City data**: GeoNames database (15,000+ cities with 15,000+ population)
- **Timezone data**: IANA Time Zone Database
- **Astronomical calculations**: SunCalc.js library

---

_Perfect for photographers, filmmakers, outdoor enthusiasts, and anyone who wants to capture the perfect golden hour lighting. Now installable as a native-feeling app on mobile devices!_
