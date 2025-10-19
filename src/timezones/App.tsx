import React, { useState, useEffect, useMemo, useRef } from "react";
import SunCalc from "suncalc";
import { List, RowComponentProps } from "react-window";

// --- Data Interfaces ---
interface City {
  name: string;
  lat: number;
  lon: number;
}

interface CitiesByTz {
  [tz: string]: City[];
}

interface SelectedTimezone {
  id: string; // tz + city
  tz: string;
  city: string;
  lat: number;
  lon: number;
  name: string; // Add name to match the inferred type
}

// --- Helper Functions & Data ---

// Generates a consistent, vibrant color from a string
const generateColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 60%)`;
};

const GlobalStyles: React.FC = () => (
  <style>{`
    /* ... existing styles ... */
    @keyframes pulse-glow {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 8px var(--glow-color);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 12px var(--glow-color);
      }
    }
    .pulsate {
      animation: pulse-glow 2s infinite ease-in-out;
    }
    body {
        font-family: 'Inter', sans-serif;
        background-color: #0a0a0a;
        background-image: radial-gradient(circle at top, #1a1a1a 0%, #0a0a0a 40%);
    }
    #root {
      min-height: 100svh;
    }
    .custom-select {
        background-color: #1f2937;
        border-color: #4b5563;
    }
    select option {
        background: #1f2937;
        color: white;
    }
  `}</style>
);

// --- Child Components ---

interface TimezoneVisualProps {
  timezone: string;
  coords: { lat: number; lon: number };
  currentTime: Date;
  color: string;
}

const TimezoneVisual: React.FC<TimezoneVisualProps> = ({
  timezone,
  coords,
  currentTime,
  color,
}) => {
  const percentage = useMemo(() => {
    try {
      const timeFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "numeric",
        minute: "numeric",
      });
      const [hourStr, minuteStr] = timeFormatter.format(currentTime).split(":");
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const totalMinutes = hour * 60 + minute;
      return (totalMinutes / (24 * 60)) * 100;
    } catch (e) {
      return 0;
    }
  }, [currentTime, timezone]);

  const gradientStyle = useMemo(() => {
    const sunTimes = SunCalc.getTimes(currentTime, coords.lat, coords.lon);

    const getMinutesInTimezone = (date: Date) => {
      const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "numeric",
        minute: "numeric",
      });
      const [hourStr, minuteStr] = formatter.format(date).split(":");
      return parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
    };

    const sunriseMinutes = getMinutesInTimezone(sunTimes.sunrise);
    const sunsetMinutes = getMinutesInTimezone(sunTimes.sunset);

    const dayStart = (sunriseMinutes / (24 * 60)) * 100;
    const dayEnd = (sunsetMinutes / (24 * 60)) * 100;
    const transition = 4; // Transition width

    const nightColor = "#0a0a16";
    const dayColor = "#fde047";

    if (dayStart <= dayEnd) {
      return {
        background: `linear-gradient(to right, 
          ${nightColor},
          ${nightColor} ${dayStart - transition}%, 
          ${dayColor} ${dayStart + transition}%, 
          ${dayColor} ${dayEnd - transition}%, 
          ${nightColor} ${dayEnd + transition}%,
          ${nightColor}
        )`,
      };
    } else {
      return {
        background: `linear-gradient(to right, 
          ${dayColor},
          ${dayColor} ${dayEnd - transition}%, 
          ${nightColor} ${dayEnd + transition}%, 
          ${nightColor} ${dayStart - transition}%, 
          ${dayColor} ${dayStart + transition}%,
          ${dayColor}
        )`,
      };
    }
  }, [timezone, currentTime, coords]);

  return (
    <div className="flex-grow flex items-center justify-center px-4">
      <div className="relative w-full pt-6">
        <div className="relative w-full h-2 rounded-full" style={gradientStyle}>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-gray-900 pulsate"
            style={
              {
                left: `calc(${percentage}% - 8px)`,
                backgroundColor: color,
                "--glow-color": color,
              } as React.CSSProperties
            }
          ></div>
        </div>
        <div className="absolute top-full mt-1 w-full h-6">
          {Array.from({ length: 25 }).map((_, i) => {
            const isLabelHour = i % 6 === 0;
            return (
              <div
                key={i}
                className="absolute -translate-x-1/2"
                style={{ left: `${(i / 24) * 100}%` }}
              >
                <div
                  className={`mx-auto w-0.5 ${
                    isLabelHour ? "h-2 bg-white/40" : "h-1 bg-white/20"
                  }`}
                ></div>
                {isLabelHour && (
                  <span className="absolute top-full mt-0.5 text-xs text-gray-400 -translate-x-1/2">
                    {i}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface TimezoneCardProps {
  selectedTz: SelectedTimezone;
  isOwnPanel: boolean;
  ownTimezone?: SelectedTimezone;
  currentTime: Date;
  onDelete?: (id: string) => void;
}

const TimezoneCard: React.FC<TimezoneCardProps> = React.memo(
  ({ selectedTz, isOwnPanel, ownTimezone, currentTime, onDelete }) => {
    const [fullscreen, setFullscreen] = useState(false);
    const { tz, city, lat, lon, id } = selectedTz;
    const color = useMemo(() => generateColor(id), [id]);

    const cardData = useMemo(() => {
      try {
        const timeFormatter = new Intl.DateTimeFormat("en-GB", {
          timeZone: tz,
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        });
        const dateFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          weekday: "long",
          month: "long",
          day: "numeric",
        });
        const tzAbbrFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          timeZoneName: "short",
        });

        const timeString = timeFormatter.format(currentTime);
        const dateString = dateFormatter.format(currentTime);
        const timeZoneName =
          tzAbbrFormatter
            .formatToParts(currentTime)
            .find((p: any) => p.type === "timeZoneName")?.value || "";

        let offsetString = "";
        if (!isOwnPanel && ownTimezone) {
          const ownDate = new Date(
            currentTime.toLocaleString("en-US", { timeZone: ownTimezone.tz })
          );
          const hereDate = new Date(
            currentTime.toLocaleString("en-US", { timeZone: tz })
          );
          const offsetHours =
            (hereDate.getTime() - ownDate.getTime()) / (1000 * 60 * 60);

          if (offsetHours === 0) {
            offsetString = "Same time";
          } else {
            const roundedOffset = Math.round(offsetHours * 2) / 2;
            offsetString = `${Math.abs(roundedOffset)}h ${
              roundedOffset >= 0 ? "ahead" : "behind"
            }`;
          }
        }

        return {
          timeString,
          dateString,
          timeZoneName,
          offsetString,
          error: null,
        };
      } catch (error) {
        console.error(`Could not update time for ${tz}:`, error);
        return { error: "Invalid Timezone" };
      }
    }, [currentTime, tz, isOwnPanel, ownTimezone]);

    if (cardData.error) {
      return (
        <div className="flex items-center justify-between w-full bg-red-900 p-4 rounded-xl gap-6">
          <p>
            {cardData.error}: {tz}
          </p>
        </div>
      );
    }

    const panelBg = isOwnPanel ? "bg-gray-800" : "bg-gray-800";

    return (
      <>
        <div
          className={`flex flex-col md:flex-row items-start md:items-center justify-between w-full ${panelBg} p-4 rounded-xl gap-4 md:gap-6 border-l-4`}
          style={{ borderColor: isOwnPanel ? "#06b6d4" : color }}
        >
          <div className="w-full md:w-56 flex-shrink-0">
            <div className="flex justify-between items-start md:block">
              <div>
                <h2 className="text-xl font-bold text-white truncate">
                  {city.replace(/_/g, " ")}
                </h2>
                <p className="text-xs text-gray-400 truncate">
                  {tz.replace(/_/g, " ")}
                </p>
              </div>
              <div className="text-right md:text-left">
                <p className="text-3xl font-mono text-slate-100 md:mt-1">
                  {cardData.timeString}
                </p>
                <p className="text-sm text-gray-300">{cardData.dateString}</p>
              </div>
            </div>
          </div>

          <div className="w-full md:flex-grow flex items-center justify-center px-0 md:px-4 mb-8 md:mb-0">
            <TimezoneVisual
              timezone={tz}
              coords={{ lat, lon }}
              currentTime={currentTime}
              color={isOwnPanel ? "#06b6d4" : color}
            />
          </div>

          <div className="w-full md:w-48 flex-shrink-0 flex flex-col md:items-end gap-2">
            {/* Desktop action buttons (md and up) */}
            <div className="hidden md:flex flex-row gap-2 mb-2 md:justify-end justify-start">
              {!isOwnPanel && onDelete && (
                <button
                  onClick={() => onDelete(id)}
                  className="text-red-500 hover:text-white font-bold text-sm transition-colors border border-red-700 rounded-full p-2 flex items-center justify-center"
                  title="Remove City"
                  aria-label="Remove"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.366-.446.958-.599 1.493-.599.535 0 1.127.153 1.493.599l.263.32h3.494a1 1 0 110 2h-.217l-.772 10.06A2 2 0 0112.02 17H7.98a2 2 0 01-1.991-1.521L5.217 5.42h-.217a1 1 0 110-2h3.494l.263-.32zM7.98 15h4.04l.75-9.78H7.23L7.98 15zm2.02-7a1 1 0 10-2 0v5a1 1 0 102 0V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setFullscreen(true)}
                className="text-cyan-400 hover:text-white font-bold text-sm transition-colors border border-cyan-700 rounded-full p-2 flex items-center justify-center"
                title="Fullscreen Clock"
                aria-label="Fullscreen"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3"
                  />
                </svg>
              </button>
            </div>
            {isOwnPanel ? (
              <>
                <span className="text-lg font-semibold text-cyan-300 hidden md:inline">
                  {cardData.timeZoneName}
                </span>
                {/* Mobile: show fullscreen button in row */}
                <div className="flex md:hidden w-full items-center justify-between">
                  <span className="text-lg font-semibold text-cyan-300">
                    {cardData.timeZoneName}
                  </span>
                  <div className="flex flex-row gap-2">
                    <button
                      onClick={() => setFullscreen(true)}
                      className="text-cyan-400 hover:text-white font-bold text-sm transition-colors border border-cyan-700 rounded-full p-2 flex items-center justify-center"
                      title="Fullscreen Clock"
                      aria-label="Fullscreen"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Desktop: offset right, buttons above; Mobile: offset and buttons in same row */}
                <div className="hidden md:flex w-full">
                  <div className="flex-grow"></div>
                  <p
                    className="text-lg font-medium text-right"
                    style={{ color }}
                  >
                    {cardData.offsetString}
                  </p>
                </div>
                <div className="flex md:hidden w-full items-center justify-between">
                  <p className="text-lg font-medium" style={{ color }}>
                    {cardData.offsetString}
                  </p>
                  <div className="flex flex-row gap-2">
                    {onDelete && (
                      <button
                        onClick={() => onDelete(id)}
                        className="text-red-500 hover:text-white font-bold text-sm transition-colors border border-red-700 rounded-full p-2 flex items-center justify-center"
                        title="Remove City"
                        aria-label="Remove"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.366-.446.958-.599 1.493-.599.535 0 1.127.153 1.493.599l.263.32h3.494a1 1 0 110 2h-.217l-.772 10.06A2 2 0 0112.02 17H7.98a2 2 0 01-1.991-1.521L5.217 5.42h-.217a1 1 0 110-2h3.494l.263-.32zM7.98 15h4.04l.75-9.78H7.23L7.98 15zm2.02-7a1 1 0 10-2 0v5a1 1 0 102 0V8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => setFullscreen(true)}
                      className="text-cyan-400 hover:text-white font-bold text-sm transition-colors border border-cyan-700 rounded-full p-2 flex items-center justify-center"
                      title="Fullscreen Clock"
                      aria-label="Fullscreen"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {fullscreen && (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-800"
            style={{ animation: "fadeIn 0.2s" }}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-6 right-8 text-4xl text-gray-400 hover:text-white font-bold focus:outline-none"
              title="Close Fullscreen"
            >
              &times;
            </button>
            <div className="flex flex-col items-center justify-center w-full">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-2 text-center">
                {city.replace(/_/g, " ")}
              </h2>
              <p className="text-lg md:text-2xl text-gray-400 mb-8 text-center">
                {tz.replace(/_/g, " ")}
              </p>
              <div className="flex flex-col items-center justify-center mb-8">
                <span className="text-[7vw] md:text-[5vw] font-mono text-yellow-200 drop-shadow-lg">
                  {cardData.timeString}
                </span>
                <span className="text-2xl md:text-3xl text-gray-300 mt-2">
                  {cardData.dateString}
                </span>
                <span className="text-xl md:text-2xl text-cyan-300 mt-4">
                  {cardData.timeZoneName}
                </span>
              </div>
              <div className="w-[80vw] max-w-6xl">
                <TimezoneVisual
                  timezone={tz}
                  coords={{ lat, lon }}
                  currentTime={currentTime}
                  color={isOwnPanel ? "#06b6d4" : color}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

interface TimezoneSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tz: string, city: City) => void;
  existingTimezoneIds: string[];
  citiesByTz: CitiesByTz | null;
}

const TimezoneSelectionModal: React.FC<TimezoneSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  existingTimezoneIds,
  citiesByTz,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const allCities = useMemo(() => {
    if (!citiesByTz) return [];
    return Object.entries(citiesByTz).flatMap(([tz, cities]) =>
      cities.map((city) => ({ tz, city }))
    );
  }, [citiesByTz]);

  const filteredCities = useMemo(() => {
    if (!searchTerm) return allCities;
    const lowerCaseSearch = searchTerm.toLowerCase();
    const cityMatches: { tz: string; city: City }[] = [];
    const tzMatches: { tz: string; city: City }[] = [];

    allCities.forEach(({ tz, city }) => {
      const cityNameLower = city.name.toLowerCase();
      const tzLower = tz.toLowerCase().replace(/_/g, " ");

      if (cityNameLower.includes(lowerCaseSearch)) {
        cityMatches.push({ tz, city });
      } else if (tzLower.includes(lowerCaseSearch)) {
        tzMatches.push({ tz, city });
      }
    });

    return [...cityMatches, ...tzMatches];
  }, [allCities, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const Row = ({ index, style }: RowComponentProps<{}>) => {
    const { tz, city } = filteredCities[index];
    const id = `${tz}:${city.name}`;
    const isSelected = existingTimezoneIds.includes(id);
    return (
      <div
        style={style}
        className="flex items-center justify-between p-3 border-b border-gray-700"
      >
        <div>
          <p className="font-bold text-white">{city.name}</p>
          <p className="text-sm text-gray-400">{tz.replace(/_/g, " ")}</p>
        </div>
        <button
          onClick={() => onSelect(tz, city)}
          disabled={isSelected}
          className={`text-white font-bold py-1 px-3 rounded text-sm ${
            isSelected
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-cyan-600 hover:bg-cyan-700"
          }`}
        >
          {isSelected ? "Selected" : "Add"}
        </button>
      </div>
    );
  };

  return (
    <div
      className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Select a City</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none"
          >
            &times;
          </button>
        </div>
        <input
          type="search"
          placeholder="Search for a city or timezone..."
          className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
        <div className="min-h-0 max-h-full flex-grow">
          <List
            rowComponent={Row}
            rowCount={filteredCities.length}
            rowHeight={65}
            rowProps={{}}
          />
        </div>
      </div>
    </div>
  );
};

// --- Searchable Select Component ---
interface SearchableSelectProps {
  options: { tz: string; city: City }[];
  value: SelectedTimezone;
  onChange: (tz: string, city: City) => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const lowerCaseSearch = searchTerm.toLowerCase();
    const cityMatches: { tz: string; city: City }[] = [];
    const tzMatches: { tz: string; city: City }[] = [];

    options.forEach(({ tz, city }) => {
      const cityNameLower = city.name.toLowerCase();
      const tzLower = tz.toLowerCase().replace(/_/g, " ");

      if (cityNameLower.includes(lowerCaseSearch)) {
        cityMatches.push({ tz, city });
      } else if (tzLower.includes(lowerCaseSearch)) {
        tzMatches.push({ tz, city });
      }
    });

    return [...cityMatches, ...tzMatches];
  }, [options, searchTerm]);

  useEffect(() => {
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

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const Row = ({ index, style }: RowComponentProps) => {
    const { tz, city } = filteredOptions[index];
    return (
      <div
        style={style}
        className="flex items-center justify-between p-3 hover:bg-gray-600 cursor-pointer"
        onClick={() => {
          onChange(tz, city);
          setIsOpen(false);
        }}
      >
        <div>
          <p className="font-bold text-white">{city.name}</p>
          <p className="text-sm text-gray-400">{tz.replace(/_/g, " ")}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className="w-full p-3 rounded-lg text-white custom-select focus:ring-2 focus:ring-cyan-500 focus:outline-none mt-2 mb-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold">{value.city.replace(/_/g, " ")}</span>
        <span className="text-gray-400 ml-2">
          ({value.tz.replace(/_/g, " ")})
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full bg-gray-800 rounded-lg shadow-xl mt-1 border border-gray-700 max-h-96 flex flex-col">
          <div className="p-2">
            <input
              type="search"
              placeholder="Search for a city or timezone..."
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className={`min-h-0 max-h-300 h-300 flex-grow overflow-y-auto`}>
            <List
              rowComponent={Row}
              rowCount={filteredOptions.length}
              rowHeight={65}
              rowProps={{}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [citiesByTz, setCitiesByTz] = useState<CitiesByTz | null>(null);
  const [ownTimezone, setOwnTimezone] = useState<SelectedTimezone | null>(null);
  const [comparisonTimezones, setComparisonTimezones] = useState<
    SelectedTimezone[]
  >([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citiesLoaded, setCitiesLoaded] = useState(false);

  const allCities = useMemo(() => {
    if (!citiesByTz) return [];
    return Object.entries(citiesByTz).flatMap(([tz, cities]) =>
      cities.map((city) => ({ tz, city }))
    );
  }, [citiesByTz]);

  useEffect(() => {
    fetch("../cities.json")
      .then((res) => res.json())
      .then((data: CitiesByTz) => {
        setCitiesByTz(data);

        // Load saved timezones from local storage
        const savedOwnTimezoneId = localStorage.getItem("ownTimezoneId");
        if (savedOwnTimezoneId) {
          const [tz, ...cityParts] = savedOwnTimezoneId.split(":");
          const cityName = cityParts.join(":");
          const city = data[tz]?.find((c) => c.name === cityName);
          if (city) {
            setOwnTimezone({
              id: savedOwnTimezoneId,
              tz,
              city: cityName,
              ...city,
            });
          }
        } else {
          // Set initial own timezone if not in local storage
          const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const citiesInTz = data[detectedTz];
          if (citiesInTz && citiesInTz.length > 0) {
            const mainCity = citiesInTz[0];
            setOwnTimezone({
              id: `${detectedTz}:${mainCity.name}`,
              tz: detectedTz,
              city: mainCity.name,
              ...mainCity,
            });
          } else {
            // Fallback
            const fallbackTz = "America/New_York";
            const fallbackCity = data[fallbackTz][0];
            setOwnTimezone({
              id: `${fallbackTz}:${fallbackCity.name}`,
              tz: fallbackTz,
              city: fallbackCity.name,
              ...fallbackCity,
            });
          }
        }

        const savedComparisonTimezoneIds = localStorage.getItem(
          "comparisonTimezoneIds"
        );
        if (savedComparisonTimezoneIds) {
          const ids = JSON.parse(savedComparisonTimezoneIds);
          const timezones = ids
            .map((id: string) => {
              const [tz, ...cityParts] = id.split(":");
              const cityName = cityParts.join(":");
              const city = data[tz]?.find((c) => c.name === cityName);
              if (!city) return null;
              return { id, tz, city: cityName, ...city };
            })
            .filter(
              (tz: SelectedTimezone | null): tz is SelectedTimezone =>
                tz !== null
            );
          setComparisonTimezones(timezones);
        }

        setTimeout(() => {
          setCitiesLoaded(true);
        }, 0);
      })
      .catch((err) => console.error("Failed to load cities.json", err));
  }, []);

  useEffect(() => {
    if (!citiesLoaded) return;
    if (ownTimezone) {
      localStorage.setItem("ownTimezoneId", ownTimezone.id);
    }
  }, [ownTimezone, citiesLoaded]);

  useEffect(() => {
    if (!citiesLoaded) return;
    const ids = comparisonTimezones.map((tz) => tz.id);
    localStorage.setItem("comparisonTimezoneIds", JSON.stringify(ids));
  }, [comparisonTimezones, citiesLoaded]);

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleSelectTimezone = (tz: string, city: City) => {
    const newTz: SelectedTimezone = {
      id: `${tz}:${city.name}`,
      tz,
      city: city.name,
      ...city,
    };
    if (
      ownTimezone?.id === newTz.id ||
      comparisonTimezones.some((ctz) => ctz.id === newTz.id)
    ) {
      return; // Already exists
    }
    setComparisonTimezones((prev) =>
      [...prev, newTz].sort((a, b) => a.id.localeCompare(b.id))
    );
    setIsModalOpen(false);
  };

  const handleDeleteTimezone = (idToRemove: string) => {
    setComparisonTimezones((prev) => prev.filter((tz) => tz.id !== idToRemove));
  };

  const handleOwnTimezoneChange = (tz: string, cityName: string) => {
    if (!citiesByTz) return;
    const city = citiesByTz[tz]?.find((c) => c.name === cityName);
    if (city) {
      setOwnTimezone({ id: `${tz}:${cityName}`, tz, city: cityName, ...city });
    }
  };

  if (!ownTimezone) {
    return <div className="text-white text-center p-10">Loading...</div>;
  }

  return (
    <>
      <GlobalStyles />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Timezone Comparison Tool
          </h1>
          <p className="text-lg text-gray-400">
            Select your primary city and compare its time with others.
          </p>
        </header>

        <main className="max-w-5xl mx-auto">
          <section className="mb-6">
            <label
              htmlFor="ownTimezone"
              className="text-lg font-medium text-gray-300"
            >
              Your City
            </label>
            <SearchableSelect
              options={allCities}
              value={ownTimezone}
              onChange={(tz, city) => handleOwnTimezoneChange(tz, city.name)}
            />
            <div className="space-y-4">
              <TimezoneCard
                selectedTz={ownTimezone}
                isOwnPanel={true}
                currentTime={currentTime}
              />
            </div>
          </section>

          <section>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-300">Compare To</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Add City
              </button>
            </div>
            <div className="space-y-4">
              {comparisonTimezones
                .filter((tz) => tz.id !== ownTimezone.id)
                .map((tz) => (
                  <TimezoneCard
                    key={tz.id}
                    selectedTz={tz}
                    isOwnPanel={false}
                    ownTimezone={ownTimezone}
                    currentTime={currentTime}
                    onDelete={handleDeleteTimezone}
                  />
                ))}
            </div>
          </section>
        </main>

        <TimezoneSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectTimezone}
          existingTimezoneIds={[
            ownTimezone.id,
            ...comparisonTimezones.map((tz) => tz.id),
          ]}
          citiesByTz={citiesByTz}
        />
      </div>
    </>
  );
};

export default App;
