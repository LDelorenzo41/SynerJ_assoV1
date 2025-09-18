// MobileTopBar.tsx
import React from 'react';
import { Menu, Building } from 'lucide-react';

interface AssociationInfo {
  id: string;
  name: string;
  logo_url: string | null;
}

interface MobileTopBarProps {
  onMenuToggle: () => void;
  associationInfo: AssociationInfo | null;
  loading?: boolean;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({ 
  onMenuToggle, 
  associationInfo,
  loading = false
}) => (
  <div className="lg:hidden fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-30">
    <div className="flex items-center justify-between px-4 h-16">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SynerJ
        </div>
      </div>

      {/* Association info - masquée pendant le loading */}
      {!loading && associationInfo && (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {associationInfo.logo_url ? (
              <img 
                src={associationInfo.logo_url} 
                alt={`Logo ${associationInfo.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.fallback-icon')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-icon flex items-center justify-center w-full h-full';
                    fallback.innerHTML = '<svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4l-1-1-1 1-1-1-1 1V5z" clip-rule="evenodd"></path></svg>';
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <Building className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <span className="text-sm text-gray-600 font-medium max-w-32 truncate">
            {associationInfo.name}
          </span>
        </div>
      )}
      
      {/* Skeleton pendant le loading */}
      {loading && (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      )}
    </div>
  </div>
);