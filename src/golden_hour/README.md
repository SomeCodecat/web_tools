# Golden Hour Calculator

A responsive web application for calculating golden hour times for photography and cinematography. Find the perfect lighting conditions for your shoots with precise astronomical calculations.

## ✨ Key Features

- **🌅 Golden Hour Times**: Morning and evening golden hour calculations with live countdowns
- **📍 Smart Location**: Search thousands of cities or use geolocation
- **🔴 Live Alerts**: Real-time banner notifications when golden hour is currently active
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🎨 Visual Timeline**: Interactive daylight visualization showing the entire day's light schedule
- **🔗 Shareable URLs**: URL parameters for sharing specific locations and dates

## 🚀 How to Use

1. **Select Location**: Search for your city or click the location icon for auto-detection
2. **Choose Date**: Use arrow buttons to browse dates or stay on today for real-time updates
3. **View Times**: See golden hour start/end times with live countdowns
4. **Share**: Copy the URL to share your current location and date with others

## 🔗 URL Parameters

You can bookmark or share specific locations and dates using URL parameters:

- **Place**: `?place=CityName,Timezone` (e.g., `?place=New York,America/New_York`)
- **Date**: `?date=YYYY-MM-DD` or `?date=today` (e.g., `?date=2025-12-25` or `?date=today`)
- **Relative Dates**: `?date=today+1`, `?date=today-2` (tomorrow, day before yesterday)
- **Combined**: `?place=Paris,Europe/Paris&date=today+3`

## ⚙️ Calculation Modes

- **±6° Mode** (default): Sun between -6° and +6° altitude for precise golden hour timing
- **SunCalc Mode**: Uses SunCalc.js built-in algorithm for alternative calculations

_Your preferred mode is automatically saved and restored._

## 🛠️ Technical Stack

- React 19 with TypeScript for modern, type-safe development
- SunCalc.js for accurate astronomical calculations
- Tailwind CSS for responsive styling
- LocalStorage for remembering preferences
- URL parameter support for sharing and bookmarking

## 🎯 Perfect For

- **📷 Photographers**: Plan portrait and landscape shoots with optimal lighting
- **🎬 Cinematographers**: Schedule filming for the best natural light
- **🌅 Enthusiasts**: Never miss another golden hour moment
- **📊 Planning**: Share locations and dates with team members or clients

---

_Built for anyone who loves capturing beautiful natural light! 📸✨_
