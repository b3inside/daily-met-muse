
import { Link, useLocation } from "react-router-dom";
import { Calendar, Image } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-museum-navy rounded-lg group-hover:bg-museum-gold transition-colors duration-300">
              <Image className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-playfair font-bold text-museum-navy">
                Daily Art
              </h1>
              <p className="text-xs text-gray-600 font-inter">
                Metropolitan Museum Collection
              </p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={cn(
                "px-4 py-2 rounded-lg font-inter font-medium transition-all duration-200",
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
                "px-4 py-2 rounded-lg font-inter font-medium transition-all duration-200 flex items-center space-x-2",
                location.pathname === "/calendar"
                  ? "bg-museum-navy text-white shadow-lg"
                  : "text-gray-700 hover:text-museum-navy hover:bg-gray-100"
              )}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
