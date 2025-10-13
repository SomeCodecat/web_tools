import React, { useState, useEffect, useMemo } from "react";

// --- Helper Functions & Data ---

// Fallback for environments where Intl.supportedValuesOf is not available
const ALL_TIMEZONES: string[] =
  typeof (Intl as any).supportedValuesOf === "function"
    ? (Intl as any).supportedValuesOf("timeZone")
    : [
        "Pacific/Midway",
        "America/Adak",
        "Etc/GMT+10",
        "Pacific/Marquesas",
        "Pacific/Gambier",
        "America/Anchorage",
        "America/Los_Angeles",
        "America/Denver",
        "America/Chicago",
        "America/New_York",
        "America/Caracas",
        "America/Santiago",
        "America/Sao_Paulo",
        "Atlantic/Azores",
        "Europe/London",
        "Europe/Berlin",
        "Europe/Moscow",
        "Asia/Dubai",
        "Asia/Karachi",
        "Asia/Dhaka",
        "Asia/Bangkok",
        "Asia/Hong_Kong",
        "Asia/Tokyo",
        "Australia/Sydney",
        "Pacific/Auckland",
        // ... (add more as needed)
      ];
interface GroupedTimezones {
  [region: string]: string[];
}

const GROUPED_TIMEZONES: GroupedTimezones =
  ALL_TIMEZONES.reduce<GroupedTimezones>((acc, tz) => {
    const region = tz.split("/")[0];
    if (!acc[region]) acc[region] = [];
    acc[region].push(tz);
    return acc;
  }, {});

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
    body {
        font-family: 'Inter', sans-serif;
        background-color: #0a0a0a;
        background-image: radial-gradient(circle at top, #1a1a1a 0%, #0a0a0a 40%);
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
  currentTime: Date;
  color: string;
}

const TimezoneVisual: React.FC<TimezoneVisualProps> = ({
  timezone,
  currentTime,
  color,
}) => {
  // Memoize timeline style calculations for performance
  const visualStyle = useMemo(() => {
    try {
      const timeFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "numeric",
        minute: "numeric",
        // hourCycle: "h23", // Removed, not in DateTimeFormatOptions
      });
      const [hourStr, minuteStr] = timeFormatter.format(currentTime).split(":");
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      const percentage = ((hour * 60 + minute) / (24 * 60)) * 100;
      const backgroundPositionX = 50 - percentage;

      const nightColor = "#0f172a"; // A deep blue for night
      const gradient = `linear-gradient(to right, ${nightColor} 0%, ${nightColor} 25%, ${color} 50%, ${color} 65%, ${nightColor} 90%, ${nightColor} 100%)`;

      return {
        backgroundPositionX: `${backgroundPositionX}%`,
        backgroundImage: gradient,
      };
    } catch (e) {
      // In case of an error, fallback to a neutral position
      return { backgroundPositionX: "50%" };
    }
  }, [currentTime, timezone, color]);

  return (
    <div className="flex-grow">
      <div
        className="h-6 w-full bg-gray-700 rounded-full relative overflow-hidden"
        style={{
          backgroundSize: "200% 100%",
          transition: "background-position-x 1s linear",
          ...visualStyle,
        }}
      >
        {/* Hour markers */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-px h-1/2 bg-white/20"
            style={{ left: `${(100 / 24) * i}%` }}
          ></div>
        ))}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-red-500 shadow-lg rounded-full"></div>
      </div>
    </div>
  );
};

interface TimezoneCardProps {
  timezone: string;
  isOwnPanel: boolean;
  ownTimezone?: string;
  currentTime: Date;
  onDelete?: (tz: string) => void;
}

const TimezoneCard: React.FC<TimezoneCardProps> = React.memo(
  ({ timezone, isOwnPanel, ownTimezone, currentTime, onDelete }) => {
    const color = useMemo(() => generateColor(timezone), [timezone]);

    const cardData = useMemo(() => {
      try {
        const timeFormatter = new Intl.DateTimeFormat("en-GB", {
          timeZone: timezone,
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          // hourCycle: "h23", // Removed, not in DateTimeFormatOptions
        });
        const dateFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          weekday: "long",
          month: "long",
          day: "numeric",
        });
        const tzAbbrFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          timeZoneName: "short",
        });

        const timeString = timeFormatter.format(currentTime);
        const dateString = dateFormatter.format(currentTime);
        // Type assertion for formatToParts and find
        // TypeScript: formatToParts is available in ES2017+, but type may not exist in your config. Use 'any' for the callback param.
        const timeZoneName =
          tzAbbrFormatter
            .formatToParts(currentTime)
            .find((p: any) => p.type === "timeZoneName")?.value || "";

        let offsetString = "";
        if (!isOwnPanel && ownTimezone) {
          const ownDate = new Date(
            currentTime.toLocaleString("en-US", { timeZone: ownTimezone })
          );
          const hereDate = new Date(
            currentTime.toLocaleString("en-US", { timeZone: timezone })
          );
          const offsetHours =
            (hereDate.getTime() - ownDate.getTime()) / (1000 * 60 * 60);

          if (offsetHours === 0) {
            offsetString = "Same time";
          } else {
            const roundedOffset = Math.round(offsetHours * 2) / 2; // Round to nearest 0.5
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
        console.error(`Could not update time for ${timezone}:`, error);
        return { error: "Invalid Timezone" };
      }
    }, [currentTime, timezone, isOwnPanel, ownTimezone]);

    if (cardData.error) {
      return (
        <div className="flex items-center justify-between w-full bg-red-900 p-4 rounded-xl gap-6">
          <p>
            {cardData.error}: {timezone}
          </p>
        </div>
      );
    }

    const panelBg = isOwnPanel ? "bg-gray-800" : "bg-gray-800";

    return (
      <div
        className={`flex items-center justify-between w-full ${panelBg} p-4 rounded-xl gap-6 border-l-4`}
        style={{ borderColor: isOwnPanel ? "#06b6d4" : color }}
      >
        {/* Left: Info */}
        <div className="w-56 flex-shrink-0">
          <h2 className="text-xl font-bold text-white truncate">
            {timezone.replace(/_/g, " ").split("/").pop()}
          </h2>
          <p className="text-xs text-gray-400 truncate">
            {timezone.replace(/_/g, " ")}
          </p>
          <p className="text-3xl font-mono text-slate-100 mt-1">
            {cardData.timeString}
          </p>
          <p className="text-sm text-gray-300">{cardData.dateString}</p>
        </div>

        {/* Middle: Timeline */}
        <TimezoneVisual
          timezone={timezone}
          currentTime={currentTime}
          color={isOwnPanel ? "#67e8f9" : color}
        />

        {/* Right: Offset & Controls */}
        <div className="w-32 flex-shrink-0 text-right">
          {isOwnPanel ? (
            <span className="text-lg font-semibold text-cyan-300">
              {cardData.timeZoneName}
            </span>
          ) : (
            <>
              <p className="text-lg font-medium" style={{ color }}>
                {cardData.offsetString}
              </p>
              {onDelete && (
                <button
                  onClick={() => onDelete(timezone)}
                  className="text-gray-500 hover:text-red-500 font-bold text-sm mt-2 transition-colors"
                >
                  REMOVE
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

interface TimezoneSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tz: string) => void;
  existingTimezones: string[];
}

const TimezoneSelectionModal: React.FC<TimezoneSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  existingTimezones,
}) => {
  // ... (This component remains the same)
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTimezones = useMemo(() => {
    if (!searchTerm) return ALL_TIMEZONES;
    const lowerCaseSearch = searchTerm.toLowerCase().replace(/_/g, " ");
    return ALL_TIMEZONES.filter((tz: string) =>
      tz.toLowerCase().replace(/_/g, " ").includes(lowerCaseSearch)
    );
  }, [searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Select a Timezone</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none"
          >
            &times;
          </button>
        </div>
        <input
          type="search"
          placeholder="Search for a city or region..."
          className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
        <div
          id="timezoneListContainer"
          className="max-h-[60vh] overflow-y-auto"
        >
          <ul id="timezoneList">
            {filteredTimezones.map((tz: string) => (
              <li
                key={tz}
                onClick={() => !existingTimezones.includes(tz) && onSelect(tz)}
                className={`p-3 rounded-lg transition-colors ${
                  existingTimezones.includes(tz)
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-700"
                }`}
              >
                {tz.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [ownTimezone, setOwnTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return "America/New_York";
    }
  });
  const [comparisonTimezones, setComparisonTimezones] = useState([
    "Europe/London",
    "Asia/Tokyo",
    "America/Los_Angeles",
  ]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleSelectTimezone = (tz: string) => {
    if (!comparisonTimezones.includes(tz) && ownTimezone !== tz) {
      setComparisonTimezones((prev) => [...prev, tz].sort());
    }
    setIsModalOpen(false);
  };

  const handleDeleteTimezone = (tzToRemove: string) => {
    setComparisonTimezones((prev) => prev.filter((tz) => tz !== tzToRemove));
  };

  return (
    <>
      <GlobalStyles />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Timezone Comparison Tool
          </h1>
          <p className="text-lg text-gray-400">
            Select your primary timezone and compare it with others.
          </p>
        </header>

        <main className="max-w-5xl mx-auto">
          <section className="mb-6">
            <label
              htmlFor="ownTimezone"
              className="text-lg font-medium text-gray-300"
            >
              Your Timezone
            </label>
            <select
              id="ownTimezone"
              className="w-full p-3 rounded-lg text-white custom-select focus:ring-2 focus:ring-cyan-500 focus:outline-none mt-2 mb-4"
              value={ownTimezone}
              onChange={(e) => setOwnTimezone(e.target.value)}
            >
              {Object.keys(GROUPED_TIMEZONES)
                .sort()
                .map((region) => (
                  <optgroup label={region} key={region}>
                    {GROUPED_TIMEZONES[region].sort().map((tz: string) => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </option>
                    ))}
                  </optgroup>
                ))}
            </select>
            <div className="space-y-4">
              <TimezoneCard
                timezone={ownTimezone}
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
                Add Timezone
              </button>
            </div>
            <div className="space-y-4">
              {comparisonTimezones
                .filter((tz) => tz !== ownTimezone)
                .map((tz) => (
                  <TimezoneCard
                    key={tz}
                    timezone={tz}
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
          existingTimezones={[ownTimezone, ...comparisonTimezones]}
        />
      </div>
    </>
  );
};

export default App;
