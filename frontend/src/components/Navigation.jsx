import { useState } from 'react';
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Calendar, ClipboardCheck, UserCircle, LogOut, Search, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export function Navigation({ currentUser, navigateTo, onLogout, currentPage }) {
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const isLeader = currentUser?.role === 'Leader';

  const handleGlobalSearch = (term) => {
    setGlobalSearchTerm(term);
    if (term.length > 2) {
      // Mock search results - in real app, this would call an API
      const mockResults = [
        { type: 'user', id: '1', title: 'Jean Hakizimana', subtitle: 'jean.haki@rpfinkotanyi.rw', page: 'members' },
        { type: 'event', id: '2', title: 'Youth Conference', subtitle: '2025-12-27', page: 'events' },
        { type: 'page', id: '3', title: 'Member Management', subtitle: 'Manage FPR Inkotanyi members', page: 'members' },
        { type: 'page', id: '4', title: 'Event Management', subtitle: 'Create and manage Inkotanyi events', page: 'events' },
        { type: 'page', id: '5', title: 'Attendance Tracking', subtitle: 'Track event attendance', page: 'attendance' },
      ].filter(item => 
        item.title.toLowerCase().includes(term.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(mockResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (result) => {
    navigateTo(result.page, result.type === 'user' ? result.id : null);
    setShowGlobalSearch(false);
    setGlobalSearchTerm('');
    setSearchResults([]);
  };

  return (
    <nav className="bg-gradient-to-r from-[#1E2426] via-[#2990CB] to-[#2DA5DE] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigateTo(isLeader ? 'leader-dashboard' : 'member-dashboard')}
          >
            <BrandLogo size="sm" />
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            {/* Global Search */}
            <button
              onClick={() => setShowGlobalSearch(true)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Global Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {showGlobalSearch && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users, events, pages..."
                        value={globalSearchTerm}
                        onChange={(e) => handleGlobalSearch(e.target.value)}
                        className="flex-1 outline-none text-lg text-gray-900"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setShowGlobalSearch(false);
                          setGlobalSearchTerm('');
                          setSearchResults([]);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{result.title}</div>
                          <div className="text-sm text-gray-500">{result.subtitle}</div>
                          <div className="text-xs text-blue-600 mt-1 capitalize">{result.type}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {globalSearchTerm.length > 2 && searchResults.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No results found for "{globalSearchTerm}"
                    </div>
                  )}
                  
                  {globalSearchTerm.length <= 2 && globalSearchTerm.length > 0 && (
                    <div className="p-8 text-center text-gray-500">
                      Type at least 3 characters to search
                    </div>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={() => navigateTo(isLeader ? 'leader-dashboard' : 'member-dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === (isLeader ? 'leader-dashboard' : 'member-dashboard')
                ? 'bg-white/20'
                : 'hover:bg-white/10'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            {isLeader && (
              <button
                onClick={() => navigateTo('members')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === 'members' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
              >
                <Users className="w-5 h-5" />
                Members
              </button>
            )}

            <button
              onClick={() => navigateTo('events')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === 'events' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
            >
              <Calendar className="w-5 h-5" />
              Events
            </button>

            <button
              onClick={() => navigateTo('attendance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === 'attendance' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
            >
              <ClipboardCheck className="w-5 h-5" />
              Attendance
            </button>

            <button
              onClick={() => navigateTo('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === 'profile' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
            >
              <UserCircle className="w-5 h-5" />
              Profile
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-[#E21526]/80 hover:bg-[#E21526] rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
