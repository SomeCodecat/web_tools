import React from "react";
import SunCalc from "suncalc";
import { List, RowComponentProps } from "react-window";

// --- Types ---
interface City {
  name: string;
  lat: number;
  lon: number;
}

interface CityInfo {
  tz: string;
  city: City;
}

type ExtendedSunTimes = SunCalc.GetTimesResult & {
  goldenHourMorningStart?: Date | null;
  goldenHourMorningEnd?: Date | null;
  goldenHourEveningStart?: Date | null;
  goldenHourEveningEnd?: Date | null;
};

// Use SunCalc.GetTimesResult for sunTimes type

// --- Helper: Debounce Hook ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Child Components ---

const GlobalStyles = () => (
  <style>{`
      body {
        font-family: 'Inter', sans-serif;
        background-color: #0F172A;
        color: #F8FAFC;
        background-image: radial-gradient(circle at top, #1E293B 0%, #0F172A 50%);
        min-height: 100vh;
      }
      .card-bg {
        background-color: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(51, 65, 85, 0.5);
      }
      .highlight-gold {
        color: #FBBF24;
      }
      .highlight-blue {
        color: #60A5FA;
      }
       /* Simple fade-in animation */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-in {
        animation: fadeIn 0.5s ease-out forwards;
      }
    `}</style>
);

// --- Searchable Select Component (refactored for CityInfo) ---
interface SearchableSelectProps {
  options: CityInfo[];
  value: CityInfo | null;
  onChange: (cityInfo: CityInfo) => void;
  label?: string;
  placeholder?: string;
  inputClassName?: string;
}

const SearchableSelect: React.FC<
  SearchableSelectProps & { onLocate?: () => void }
> = ({
  options,
  value,
  onChange,
  label,
  onLocate,
  placeholder,
  inputClassName,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  const filteredOptions = React.useMemo(() => {
    if (!debouncedSearchTerm) return options;
    const lowerCaseSearch = debouncedSearchTerm.toLowerCase();
    return options.filter(
      (cityInfo) =>
        cityInfo.city.name.toLowerCase().includes(lowerCaseSearch) ||
        cityInfo.tz.toLowerCase().replace(/_/g, " ").includes(lowerCaseSearch)
    );
  }, [options, debouncedSearchTerm]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  React.useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const Row = ({ index, style }: RowComponentProps) => {
    const { tz, city } = filteredOptions[index];
    return (
      <div
        style={style}
        className="flex items-center justify-between p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50"
        onClick={() => {
          onChange(filteredOptions[index]);
          setIsOpen(false);
        }}
      >
        <div>
          <p className="font-bold text-white">{city.name}</p>
          <p className="text-sm text-slate-400">{tz.replace(/_/g, " ")}</p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative w-full max-w-md mx-auto flex items-center gap-2"
      ref={wrapperRef}
    >
      <div className="flex-1">
        {label && (
          <label className="block text-sm font-medium text-slate-400 mb-1">
            {label}
          </label>
        )}
        <button
          type="button"
          className={`w-full px-4 py-2 rounded-lg text-slate-200 bg-transparent border border-transparent focus:ring-2 focus:ring-yellow-400 focus:outline-none text-left transition placeholder:text-slate-400 ${
            inputClassName || ""
          }`}
          style={{ background: "none" }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {value ? (
            <>
              <span className="font-bold">{value.city.name}</span>
              <span className="text-slate-400 ml-2">
                ({value.tz.replace(/_/g, " ")})
              </span>
            </>
          ) : (
            <span className="text-slate-400">
              {placeholder || "Select a city..."}
            </span>
          )}
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full bg-slate-800 rounded-lg shadow-xl mt-1 border border-slate-700 max-h-96 flex flex-col">
            <div className="p-2">
              <input
                type="search"
                placeholder="Search for a city or timezone..."
                className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="min-h-0 max-h-300 h-300 flex-grow overflow-y-auto">
              {/* List of options rendered by react-window List */}
              <List
                rowComponent={Row}
                rowCount={filteredOptions.length}
                rowHeight={65}
                rowProps={{}}
              />
              {filteredOptions.length === 0 && (
                <div className="p-3 text-slate-400">No results found.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ResultCardProps {
  title: string;
  time: string;
  icon: string;
  period: string;
  countdown?: string;
  className?: string;
  style?: React.CSSProperties;
}
const ResultCard: React.FC<ResultCardProps> = ({
  title,
  time,
  icon,
  period,
  countdown,
  className,
  style,
}) => (
  <div
    className={`card-bg p-6 rounded-2xl text-center fade-in ${className || ""}`}
    style={style}
  >
    <div className="text-4xl mb-2">{icon}</div>
    <h3 className="text-lg font-bold text-slate-300">{title}</h3>
    <p className="text-2xl font-mono font-bold">{time}</p>
    {countdown && <p className="text-xs text-slate-500 mt-1">{countdown}</p>}
    <p className="text-sm text-slate-400">{period}</p>
  </div>
);

const DaylightVisual: React.FC<{
  sunTimes: SunCalc.GetTimesResult & {
    goldenHourMorningStart?: Date | null;
    goldenHourMorningEnd?: Date | null;
    goldenHourEveningStart?: Date | null;
    goldenHourEveningEnd?: Date | null;
  };
}> = ({ sunTimes }) => {
  // Helper to get percentage of the day for a given time
  const getPercentage = (time: Date | undefined | null) => {
    if (!time) return 0;
    return ((time.getHours() * 60 + time.getMinutes()) / (24 * 60)) * 100;
  };

  // Use the same golden hour times as the cards
  const sunrisePercent = getPercentage(sunTimes.sunrise);
  const sunsetPercent = getPercentage(sunTimes.sunset);
  const morningGoldenHourStartPercent = getPercentage(
    sunTimes.goldenHourMorningStart
  );
  const morningGoldenHourEndPercent = getPercentage(
    sunTimes.goldenHourMorningEnd
  );
  const eveningGoldenHourStartPercent = getPercentage(
    sunTimes.goldenHourEveningStart
  );
  const eveningGoldenHourEndPercent = getPercentage(
    sunTimes.goldenHourEveningEnd
  );

  const nightColor = "#0F172A";
  const dayColor = "#60A5FA";
  const goldenHourColor = "#FBBF24";

  return (
    <div className="w-full mt-8 fade-in" style={{ animationDelay: "0.4s" }}>
      <div
        className="relative w-full h-3 rounded-full overflow-hidden"
        style={{
          background: `linear-gradient(to right, 
            ${nightColor} 0%, 
            ${nightColor} ${sunrisePercent - 2}%, 
            ${dayColor} ${sunrisePercent + 2}%, 
            ${dayColor} ${sunsetPercent - 2}%, 
            ${nightColor} ${sunsetPercent + 2}%, 
            ${nightColor} 100%)`,
        }}
      >
        {/* Morning Golden Hour */}
        {morningGoldenHourStartPercent < morningGoldenHourEndPercent && (
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${morningGoldenHourStartPercent}%`,
              width: `${
                morningGoldenHourEndPercent - morningGoldenHourStartPercent
              }%`,
              backgroundColor: goldenHourColor,
              opacity: 0.8,
            }}
          ></div>
        )}

        {/* Evening Golden Hour */}
        {eveningGoldenHourStartPercent < eveningGoldenHourEndPercent && (
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${eveningGoldenHourStartPercent}%`,
              width: `${
                eveningGoldenHourEndPercent - eveningGoldenHourStartPercent
              }%`,
              backgroundColor: goldenHourColor,
              opacity: 0.8,
            }}
          ></div>
        )}
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>
    </div>
  );
};

// --- Helper Functions ---

const calculateCountdown = (targetTime: Date | null | undefined): string => {
  if (!targetTime) return "";

  const now = new Date();
  const timeDiff = targetTime.getTime() - now.getTime();

  if (timeDiff <= 0) {
    // Time has passed, check if it's from today
    const targetDate = new Date(targetTime);
    const today = new Date();

    // Check if target time is from today (same year, month, and day)
    const isToday =
      targetDate.getFullYear() === today.getFullYear() &&
      targetDate.getMonth() === today.getMonth() &&
      targetDate.getDate() === today.getDate();

    if (!isToday) {
      // Don't show "hours ago" for previous days
      return "";
    }

    // Show how long ago (only for today)
    const timeSince = Math.abs(timeDiff);
    const hours = Math.floor(timeSince / (1000 * 60 * 60));
    const minutes = Math.floor((timeSince % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `(${hours}:${minutes.toString().padStart(2, "0")} hours ago)`;
    } else {
      return `(${minutes} minutes ago)`;
    }
  }

  // Time is in the future, show countdown
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `(in ${hours}:${minutes.toString().padStart(2, "0")} hours)`;
  } else {
    return `(in ${minutes} minutes)`;
  }
};

const getCurrentGoldenHour = (
  sunTimes: ExtendedSunTimes
): {
  isActive: boolean;
  type: "morning" | "evening" | null;
  start: Date | null;
  end: Date | null;
} => {
  const now = new Date();
  const today = new Date();

  // Check if we're viewing today
  const viewingToday =
    sunTimes.sunrise &&
    sunTimes.sunrise.getFullYear() === today.getFullYear() &&
    sunTimes.sunrise.getMonth() === today.getMonth() &&
    sunTimes.sunrise.getDate() === today.getDate();

  if (!viewingToday) {
    return { isActive: false, type: null, start: null, end: null };
  }

  // Check morning golden hour
  if (sunTimes.goldenHourMorningStart && sunTimes.goldenHourMorningEnd) {
    if (
      now >= sunTimes.goldenHourMorningStart &&
      now <= sunTimes.goldenHourMorningEnd
    ) {
      return {
        isActive: true,
        type: "morning",
        start: sunTimes.goldenHourMorningStart,
        end: sunTimes.goldenHourMorningEnd,
      };
    }
  }

  // Check evening golden hour
  if (sunTimes.goldenHourEveningStart && sunTimes.goldenHourEveningEnd) {
    if (
      now >= sunTimes.goldenHourEveningStart &&
      now <= sunTimes.goldenHourEveningEnd
    ) {
      return {
        isActive: true,
        type: "evening",
        start: sunTimes.goldenHourEveningStart,
        end: sunTimes.goldenHourEveningEnd,
      };
    }
  }

  return { isActive: false, type: null, start: null, end: null };
};

const GoldenHourBanner: React.FC<{
  sunTimes: ExtendedSunTimes;
  showTest?: boolean;
}> = ({ sunTimes, showTest = false }) => {
  const currentGoldenHour = getCurrentGoldenHour(sunTimes);

  // Show test banner or actual active golden hour
  if (!currentGoldenHour.isActive && !showTest) return null;

  // Use test data if showing test banner
  const bannerData = showTest
    ? {
        type: "morning" as const,
        start: new Date(new Date().setHours(7, 30, 0, 0)),
        end: new Date(new Date().setHours(8, 30, 0, 0)),
      }
    : {
        type: currentGoldenHour.type!,
        start: currentGoldenHour.start!,
        end: currentGoldenHour.end!,
      };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  // Calculate remaining time
  const calculateRemainingTime = (endTime: Date) => {
    const now = new Date();
    const timeDiff = endTime.getTime() - now.getTime();

    if (timeDiff <= 0) return "0 minutes left";

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")} hours left`;
    } else {
      return `${minutes} minutes left`;
    }
  };

  const remainingTime = showTest
    ? "35 minutes left" // Test mode shows fixed time
    : calculateRemainingTime(bannerData.end);

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl fade-in">
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl">
          {bannerData.type === "morning" ? "🌅" : "🌇"}
        </span>
        <div className="text-center">
          <p className="text-yellow-400 font-bold text-lg">
            {bannerData.type === "morning" ? "Morning" : "Evening"} Golden Hour
            is Active! {showTest && "(Test Mode)"}
          </p>
          <p className="text-slate-300 text-sm">
            Started at {formatTime(bannerData.start)} • Ends at{" "}
            {formatTime(bannerData.end)}
          </p>
          <p className="text-yellow-300 font-semibold text-sm mt-1">
            ({remainingTime})
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Helper Functions for LocalStorage ---

const STORAGE_KEY = "golden-hour-last-city";

const saveLastCity = (cityInfo: CityInfo) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cityInfo));
  } catch (error) {
    console.warn("Failed to save city to localStorage:", error);
  }
};

const getLastCity = (): CityInfo | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn("Failed to load city from localStorage:", error);
    return null;
  }
};

// --- Main App Component ---

const App: React.FC = () => {
  const [cities, setCities] = React.useState<CityInfo[]>([]);
  const [selectedLocation, setSelectedLocation] =
    React.useState<CityInfo | null>(null);
  const [date, setDate] = React.useState<Date>(new Date());
  const [mode, setMode] = React.useState<"plusminus6" | "suncalc">(
    "plusminus6"
  );
  const [sunTimes, setSunTimes] = React.useState<ExtendedSunTimes | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [showTestBanner, setShowTestBanner] = React.useState(false);

  const isDevMode =
    new URLSearchParams(window.location.search).get("dev") === "1" ||
    window.location.hostname === "localhost";

  // Keep today's date string updated at midnight
  const [todayDateString, setTodayDateString] = React.useState(() =>
    new Date().toDateString()
  );
  React.useEffect(() => {
    // Calculate milliseconds until next midnight
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();
    const timeout = setTimeout(() => {
      setTodayDateString(new Date().toDateString());
    }, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, [todayDateString]);

  // Update current time every minute for countdown
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Update favicon based on next golden hour
  React.useEffect(() => {
    const updateFavicon = (icon: string) => {
      const existingLink = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement;
      const svgUrl = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${encodeURIComponent(
        icon
      )}</text></svg>`;

      if (existingLink) {
        existingLink.href = svgUrl;
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = svgUrl;
        document.head.appendChild(link);
      }
    };

    if (sunTimes && selectedLocation) {
      const now = new Date();
      const today = new Date();

      // Only update favicon when viewing today's date
      const viewingToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

      if (viewingToday) {
        // Check which golden hour is next
        const morningStart = sunTimes.goldenHourMorningStart;
        const eveningStart = sunTimes.goldenHourEveningStart;

        let nextIcon = "🌅"; // Default to sunrise

        if (morningStart && eveningStart) {
          if (now < morningStart) {
            // Before morning golden hour - show sunrise
            nextIcon = "🌅";
          } else if (now < eveningStart) {
            // Between morning and evening - show sunset
            nextIcon = "🌇";
          } else {
            // After evening golden hour - show sunrise for tomorrow
            nextIcon = "🌅";
          }
        }

        updateFavicon(nextIcon);
      } else {
        // Not viewing today, default to sunrise
        updateFavicon("🌅");
      }
    } else {
      // No location selected, default to sunrise
      updateFavicon("🌅");
    }
  }, [sunTimes, selectedLocation, date, currentTime]); // Update when any of these change

  // Fetch and process city data on initial load
  React.useEffect(() => {
    fetch("../cities.json")
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch cities.json");
        return res.json();
      })
      .then((data) => {
        // data is { [tz: string]: City[] }
        const allCities: CityInfo[] = Object.entries(data).flatMap(
          ([tz, cityList]) =>
            Array.isArray(cityList)
              ? (cityList as City[]).map((city) => ({ tz, city }))
              : []
        );
        setCities(allCities);

        // Try to restore last saved city
        const lastCity = getLastCity();
        if (lastCity) {
          // Find the city in the loaded cities to ensure it still exists
          const foundCity = allCities.find(
            (cityInfo) =>
              cityInfo.city.name === lastCity.city.name &&
              cityInfo.tz === lastCity.tz
          );
          if (foundCity) {
            setSelectedLocation(foundCity);
          }
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to process city data:", err);
        setError("Could not load city data.");
        setIsLoading(false);
      });
  }, []);

  // Helper to find the time when the sun is at a specific altitude
  function getTimeAtAltitude(
    date: Date,
    lat: number,
    lon: number,
    altitudeDeg: number,
    afterSunrise: boolean
  ): Date | null {
    // Binary search between sunrise and sunset (or night and sunrise)
    // Altitude in degrees
    const altRad = (altitudeDeg * Math.PI) / 180;
    const times = SunCalc.getTimes(date, lat, lon);
    let t1: Date, t2: Date;
    if (afterSunrise) {
      t1 = times.sunrise;
      t2 = times.solarNoon;
    } else {
      t1 = times.sunset;
      t2 = times.solarNoon;
    }
    // If afterSunrise, search between sunrise and solarNoon for +6deg
    // If beforeSunset, search between sunset and solarNoon for -6deg
    // But for -6deg after sunrise, search between night and sunrise
    // For +6deg before sunset, search between solarNoon and sunset
    // We'll generalize for both cases
    // For morning: -6deg (night->sunrise), +6deg (sunrise->solarNoon)
    // For evening: +6deg (solarNoon->sunset), -6deg (sunset->night)
    // We'll use a helper for both
    // We'll search for the time when the sun's altitude crosses the given value
    // We'll search in a 2-hour window around the expected time
    let start: Date, end: Date;
    if (afterSunrise && altitudeDeg > 0) {
      // Morning +6deg: sunrise to solarNoon
      start = times.sunrise;
      end = times.solarNoon;
    } else if (afterSunrise && altitudeDeg < 0) {
      // Morning -6deg: dawn to sunrise
      start = new Date(times.sunrise.getTime() - 2 * 60 * 60 * 1000);
      end = times.sunrise;
    } else if (!afterSunrise && altitudeDeg > 0) {
      // Evening +6deg: solarNoon to sunset
      start = times.solarNoon;
      end = times.sunset;
    } else {
      // Evening -6deg: sunset to night
      start = times.sunset;
      end = new Date(times.sunset.getTime() + 2 * 60 * 60 * 1000);
    }
    // Binary search
    let lo = start.getTime();
    let hi = end.getTime();
    let result: Date | null = null;
    for (let i = 0; i < 20; ++i) {
      const mid = new Date((lo + hi) / 2);
      const alt = SunCalc.getPosition(mid, lat, lon).altitude;
      if (Math.abs(alt - altRad) < 0.0005) {
        result = mid;
        break;
      }
      if (alt > altRad) {
        if (afterSunrise) {
          hi = mid.getTime();
        } else {
          lo = mid.getTime();
        }
      } else {
        if (afterSunrise) {
          lo = mid.getTime();
        } else {
          hi = mid.getTime();
        }
      }
    }
    return result || new Date((lo + hi) / 2);
  }

  // Recalculate sun times and golden hour when location, date, or mode changes
  React.useEffect(() => {
    if (selectedLocation) {
      const { lat, lon } = selectedLocation.city;
      const times = SunCalc.getTimes(date, lat, lon);

      if (mode === "plusminus6") {
        // Golden hour: sun between -6 and +6 degrees
        // Morning: -6deg (start), +6deg (end)
        // Evening: +6deg (start), -6deg (end)
        const morningStart = getTimeAtAltitude(date, lat, lon, -6, true);
        const morningEnd = getTimeAtAltitude(date, lat, lon, 6, true);
        const eveningStart = getTimeAtAltitude(date, lat, lon, 6, false);
        const eveningEnd = getTimeAtAltitude(date, lat, lon, -6, false);

        setSunTimes({
          ...times,
          goldenHourMorningStart: morningStart,
          goldenHourMorningEnd: morningEnd,
          goldenHourEveningStart: eveningStart,
          goldenHourEveningEnd: eveningEnd,
        } as SunCalc.GetTimesResult & {
          goldenHourMorningStart: Date | null;
          goldenHourMorningEnd: Date | null;
          goldenHourEveningStart: Date | null;
          goldenHourEveningEnd: Date | null;
        });
      } else {
        // Use SunCalc's built-in goldenHour and goldenHourEnd
        setSunTimes({
          ...times,
          goldenHourMorningStart: times.sunrise, // SunCalc: morning golden hour is from sunrise to goldenHourEnd
          goldenHourMorningEnd: times.goldenHourEnd,
          goldenHourEveningStart: times.goldenHour, // SunCalc: evening golden hour is from goldenHour to sunset
          goldenHourEveningEnd: times.sunset,
        } as SunCalc.GetTimesResult & {
          goldenHourMorningStart: Date | null;
          goldenHourMorningEnd: Date | null;
          goldenHourEveningStart: Date | null;
          goldenHourEveningEnd: Date | null;
        });
      }
    }
  }, [selectedLocation, date, mode]);

  const handleLocationSelect = (location: CityInfo) => {
    setSelectedLocation(location);
    saveLastCity(location);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split("-").map(Number);
    const newDate = new Date(year, month - 1, day);
    setDate(newDate);
  };

  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (d: Date | undefined) =>
    d
      ? d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "N/A";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading city data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Golden Hour Calculator
          </h1>
          <p className="text-lg text-slate-400">
            Find the perfect light for your photography.
          </p>
        </header>

        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
            <span className="text-slate-300 font-medium">
              Golden Hour Mode:
            </span>
            <button
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                mode === "plusminus6"
                  ? "bg-yellow-500 text-slate-900"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              onClick={() => setMode("plusminus6")}
              aria-pressed={mode === "plusminus6"}
            >
              ±6°
            </button>
            <button
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                mode === "suncalc"
                  ? "bg-yellow-500 text-slate-900"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              onClick={() => setMode("suncalc")}
              aria-pressed={mode === "suncalc"}
            >
              SunCalc
            </button>
          </div>
        </div>

        <main className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 mb-8 md:items-end">
            {/* Location Selector (left) */}
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-400 mb-1 ml-1 block">
                Location
              </label>
              <div className="relative">
                <div className="flex items-center rounded-xl border border-gray-600 bg-gray-700/50 px-3 py-2 relative">
                  <button
                    type="button"
                    title="Use current location"
                    className="absolute left-3 z-10 flex items-center justify-center text-gray-500 hover:text-indigo-400 focus:text-indigo-500 focus:outline-none transition-colors"
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!navigator.geolocation) {
                        alert("Geolocation is not supported by your browser.");
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          let closestCity: CityInfo | null = null;
                          let minDistance = Infinity;
                          cities.forEach((cityInfo) => {
                            const dLat = cityInfo.city.lat - latitude;
                            const dLon = cityInfo.city.lon - longitude;
                            const distance = dLat * dLat + dLon * dLon;
                            if (distance < minDistance) {
                              minDistance = distance;
                              closestCity = cityInfo;
                            }
                          });
                          if (closestCity) {
                            setSelectedLocation(closestCity);
                            saveLastCity(closestCity);
                          } else {
                            alert("No city found near your location.");
                          }
                        },
                        (err) => {
                          alert("Could not get your location.");
                        },
                        { timeout: 5000 }
                      );
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                  </button>
                  <div className="flex-1">
                    <SearchableSelect
                      options={cities}
                      value={selectedLocation}
                      onChange={handleLocationSelect}
                      label={undefined}
                      placeholder="Enter your destination"
                      inputClassName="pl-10 bg-transparent border-none shadow-none text-white placeholder-gray-500 focus:ring-0 focus:border-indigo-500 relative z-0"
                    />
                  </div>
                </div>
              </div>
              {/* Invisible spacer to match the Today button space */}
              <div
                className={`mt-2 ${
                  selectedLocation && date.toDateString() !== todayDateString
                    ? "h-8"
                    : "h-0"
                }`}
              >
                {/* This empty div maintains consistent spacing with Today button */}
              </div>
            </div>
            {/* Date Selector (right) */}
            <div className="flex-1">
              <label
                htmlFor="date-picker"
                className="text-xs font-medium text-slate-400 mb-1 ml-1 block"
              >
                Date
              </label>
              <div className="flex items-center justify-between bg-gray-700/50 px-3.5 py-2 rounded-xl border border-gray-600 text-base">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() =>
                    setDate(
                      (prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000)
                    )
                  }
                  disabled={!selectedLocation}
                  title="Previous day"
                >
                  <svg
                    className="w-5 h-5 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                </button>
                <button
                  type="button"
                  className="text-center font-semibold text-gray-200 px-3.5 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                  onClick={() => {
                    if (!selectedLocation) return;
                    const input = document.getElementById("date-picker");
                    if (input) {
                      const picker = (input as HTMLInputElement).showPicker;
                      if (picker) picker.call(input);
                      else input.click();
                    }
                  }}
                  disabled={!selectedLocation}
                >
                  {date.toDateString() === todayDateString
                    ? "Today"
                    : date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() =>
                    setDate(
                      (prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000)
                    )
                  }
                  disabled={!selectedLocation}
                  title="Next day"
                >
                  <svg
                    className="w-5 h-5 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
                <input
                  id="date-picker"
                  type="date"
                  value={formatDateForInput(date)}
                  onChange={handleDateChange}
                  className="absolute opacity-0 w-0 h-0 pointer-events-none"
                  tabIndex={-1}
                  disabled={!selectedLocation}
                />
              </div>
              {/* Today button container - conditional height */}
              <div
                className={`mt-2 flex items-center ${
                  selectedLocation && date.toDateString() !== todayDateString
                    ? "h-8"
                    : "h-0"
                }`}
              >
                {selectedLocation &&
                  date.toDateString() !== todayDateString && (
                    <button
                      type="button"
                      className="w-full px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onClick={() => setDate(new Date())}
                      title="Go to today"
                    >
                      Today
                    </button>
                  )}
              </div>
            </div>
          </div>

          {!selectedLocation && (
            <div className="text-center text-slate-400 mt-8">
              <p>Please select a city to view golden hour times.</p>
            </div>
          )}

          {sunTimes && selectedLocation && (
            <div className="card-bg p-6 sm:p-8 rounded-2xl shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {selectedLocation.city.name}
                </h2>
                <p className="text-slate-300">
                  {date.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <GoldenHourBanner sunTimes={sunTimes} showTest={showTestBanner} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultCard
                  icon="🌅"
                  title="Sunrise"
                  time={formatTime(sunTimes.sunrise)}
                  period="Beginning of light"
                  countdown={calculateCountdown(sunTimes.sunrise)}
                  className="highlight-gold"
                  style={{ animationDelay: "0.1s" }}
                />
                <ResultCard
                  icon="🌇"
                  title="Sunset"
                  time={formatTime(sunTimes.sunset)}
                  period="End of light"
                  countdown={calculateCountdown(sunTimes.sunset)}
                  className="highlight-blue"
                  style={{ animationDelay: "0.2s" }}
                />
                <ResultCard
                  icon="☀️"
                  title="Morning Golden Hour"
                  time={`${formatTime(
                    (sunTimes as ExtendedSunTimes).goldenHourMorningStart ??
                      undefined
                  )} - ${formatTime(
                    (sunTimes as ExtendedSunTimes).goldenHourMorningEnd ??
                      undefined
                  )}`}
                  period="Warm, soft light (sun -6° to +6°)"
                  countdown={calculateCountdown(
                    (sunTimes as ExtendedSunTimes).goldenHourMorningStart
                  )}
                  className="highlight-gold"
                  style={{ animationDelay: "0.3s" }}
                />
                <ResultCard
                  icon="🌙"
                  title="Evening Golden Hour"
                  time={`${formatTime(
                    (sunTimes as ExtendedSunTimes).goldenHourEveningStart ??
                      undefined
                  )} - ${formatTime(
                    (sunTimes as ExtendedSunTimes).goldenHourEveningEnd ??
                      undefined
                  )}`}
                  period="Rich, directional light (sun +6° to -6°)"
                  countdown={calculateCountdown(
                    (sunTimes as ExtendedSunTimes).goldenHourEveningStart
                  )}
                  className="highlight-gold"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>

              <DaylightVisual sunTimes={sunTimes} />
            </div>
          )}
        </main>
        <footer className="text-center mt-12 text-slate-500 text-sm">
          <div className="flex items-center justify-center gap-4">
            <p>Powered by SunCalc.js</p>
            {/* Dev Mode Button - Dev only (enable by adding ?dev=1 to URL) */}
            {isDevMode && (
              <button
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-400 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
                onClick={() => setShowTestBanner(!showTestBanner)}
                title="Toggle test banner for development"
              >
                Dev Mode
              </button>
            )}
          </div>
        </footer>
      </div>
    </>
  );
};

export default App;
