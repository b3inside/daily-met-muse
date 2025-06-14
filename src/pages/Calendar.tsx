import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { getDailyCollection, getTodayDate, formatDisplayDate } from "@/utils/metApi";
import { cn } from "@/lib/utils";
import { ArrowDown, Image } from "lucide-react";

const Calendar = () => {
  const today = getTodayDate();
  const [selectedDate, setSelectedDate] = useState(today);

  // Generate date range (last 30 days)
  const generateDateRange = () => {
    const dates = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates.reverse();
  };

  const dateRange = generateDateRange();

  const { data: selectedCollection, isLoading } = useQuery({
    queryKey: ['daily-collection', selectedDate],
    queryFn: () => getDailyCollection(selectedDate),
    enabled: !!selectedDate,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const getDayOfWeek = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDateNumber = (dateString: string) => {
    return new Date(dateString).getDate();
  };

  const isToday = (dateString: string) => {
    return dateString === today;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-museum-cream via-white to-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-museum-navy mb-4">
            Art Calendar
          </h1>
          <p className="text-xl text-gray-600 font-inter max-w-2xl mx-auto">
            Browse through our daily art collections. Each day features five unique pieces 
            from The Metropolitan Museum of Art's extensive catalog.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Calendar Grid */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-playfair font-semibold text-museum-navy mb-6">
              Select a Date
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-inter font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {dateRange.map(date => {
                  const dayOfWeek = new Date(date).getDay();
                  
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "aspect-square rounded-lg text-sm font-inter font-medium transition-all duration-200 hover:scale-105",
                        selectedDate === date
                          ? "bg-museum-navy text-white shadow-lg"
                          : isToday(date)
                          ? "bg-museum-gold text-white shadow-md"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {getDateNumber(date)}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 space-y-2 text-sm font-inter">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-museum-gold rounded-full"></div>
                  <span className="text-gray-600">Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-museum-navy rounded-full"></div>
                  <span className="text-gray-600">Selected Date</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Date Collection */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-playfair font-semibold text-museum-navy">
                {formatDisplayDate(selectedDate)}
              </h2>
              <Link
                to={`/detail?date=${selectedDate}`}
                className="inline-flex items-center space-x-2 bg-museum-navy text-white px-4 py-2 rounded-lg font-inter font-medium hover:bg-museum-gold transition-colors duration-300"
              >
                <span>View Details</span>
                <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
              </Link>
            </div>

            {isLoading && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="animate-pulse space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedCollection && (
              <div className="bg-white rounded-xl shadow-lg p-8 animate-scale-in">
                {selectedCollection.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {selectedCollection.images.map((artwork, index) => (
                      <div
                        key={artwork.id}
                        className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                      >
                        <img
                          src={artwork.primaryImageSmall || artwork.image_url}
                          alt={artwork.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-xs font-inter font-medium truncate">
                            {artwork.title}
                          </p>
                          <p className="text-xs text-gray-200 truncate">
                            {artwork.artist}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-playfair font-semibold text-gray-600 mb-2">
                      No Collection Available
                    </h3>
                    <p className="text-gray-500 font-inter">
                      No artworks were curated for this date.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
