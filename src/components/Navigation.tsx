
import { Link, useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2 sm:py-4">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
              <img 
                src={import.meta.env.BASE_URL + "lovable-uploads/f364370a-da7b-4eac-942b-2fc26bcc90ac.png"}
                alt="Museum Collection Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-playfair font-bold text-museum-navy truncate">
                Museum Collection
              </h1>
              <p className="text-xs text-gray-600 font-inter truncate">
                Daily Art
              </p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={cn(
                "px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-inter font-medium transition-all duration-200 text-sm sm:text-base",
                location.pathname === "/"
                  ? "bg-museum-navy text-white shadow-lg"
                  : "text-gray-700 hover:text-museum-navy hover:bg-gray-100"
              )}
            >
              Today
            </Link>
            <Link
              to="/calendar"
              className={cn(
                "px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-inter font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base",
                location.pathname === "/calendar"
                  ? "bg-museum-navy text-white shadow-lg"
                  : "text-gray-700 hover:text-museum-navy hover:bg-gray-100"
              )}
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Calendar</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
