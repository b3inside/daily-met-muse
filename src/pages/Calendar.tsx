
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getDailyCollection, getTodayDate, formatDisplayDate, isFutureDate } from "@/utils/metApi";
import { cn } from "@/lib/utils";
import { ArrowDown, Image, ChevronLeft, ChevronRight } from "lucide-react";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // Get user's timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Get current date in user's timezone
  const today = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD format
  
  useEffect(() => {
    // Set current date to user's timezone
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(today);
  }, [today]);

  const { data: selectedCollection, isLoading } = useQuery({
    queryKey: ['daily-collection', selectedDate],
    queryFn: () => getDailyCollection(selectedDate),
    enabled: !!selectedDate && !isFutureDate(selectedDate),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - longer since we have better caching
  });

  // Calendar generation functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        dateString,
        isToday: dateString === today,
        isSelected: dateString === selectedDate,
        isFuture: isFutureDate(dateString)
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateSelect = (dateString: string) => {
    // Don't allow selection of future dates
    if (isFutureDate(dateString)) {
      return;
    }
    setSelectedDate(dateString);
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
            Browse through our daily art collections. Each day features ten unique pieces 
            from The Metropolitan Museum of Art's extensive catalog.
          </p>
          <p className="text-sm text-gray-500 font-inter mt-2">
            Timezone: {userTimeZone}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Calendar Grid */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-playfair font-semibold text-museum-navy">
                  {getMonthName(currentDate)}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-inter font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((dayData, index) => (
                  <div key={index} className="aspect-square">
                    {dayData ? (
                      <button
                        onClick={() => handleDateSelect(dayData.dateString)}
                        disabled={dayData.isFuture}
                        className={cn(
                          "w-full h-full rounded-lg text-sm font-inter font-medium transition-all duration-200",
                          dayData.isFuture
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : dayData.isSelected
                            ? "bg-museum-navy text-white shadow-lg hover:scale-105"
                            : dayData.isToday
                            ? "bg-museum-gold text-white shadow-md hover:scale-105"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105"
                        )}
                      >
                        {dayData.day}
                      </button>
                    ) : (
                      <div className="w-full h-full"></div>
                    )}
                  </div>
                ))}
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
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded-full"></div>
                  <span className="text-gray-400">Future (Unavailable)</span>
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
              {!isFutureDate(selectedDate) && (
                <Link
                  to={`/detail?date=${selectedDate}`}
                  className="inline-flex items-center space-x-2 bg-museum-navy text-white px-4 py-2 rounded-lg font-inter font-medium hover:bg-museum-gold transition-colors duration-300"
                >
                  <span>View Details</span>
                  <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
                </Link>
              )}
            </div>

            {isFutureDate(selectedDate) && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center py-12">
                  <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-playfair font-semibold text-gray-600 mb-2">
                    Future Date Selected
                  </h3>
                  <p className="text-gray-500 font-inter">
                    Art collections are only available for today and past dates. Please select a different date.
                  </p>
                </div>
              </div>
            )}

            {!isFutureDate(selectedDate) && isLoading && (
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

            {!isFutureDate(selectedDate) && selectedCollection && (
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
      
      <Footer />
    </div>
  );
};

export default Calendar;
