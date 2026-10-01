import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  Download,
  FolderOpen,
  Grid,
  Layers,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Unit } from '../types/dieline';

interface HeaderProps {
  templateName: string;
  categoryName: string;
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
  onOpenProjects: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onFitView: () => void;
  viewMode: 'studio' | 'gallery';
  onViewModeChange: (mode: 'studio' | 'gallery') => void;
}

export const Header: React.FC<HeaderProps> = ({
  templateName,
  categoryName,
  unit,
  onUnitChange,
  onOpenTemplates,
  onOpenExport,
  onOpenProjects,
  theme,
  onToggleTheme,
  onFitView,
  viewMode,
  onViewModeChange,
}) => {
  const { user, isAuthenticated, logout, requireAuth } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 select-none z-20 shadow-xs">
      {/* Zone 1: Single text element wordmark + View switcher */}
      <div className="flex items-center gap-5">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onViewModeChange('gallery');
          }}
          className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2 cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block shadow-xs" />
          <span>Dieline Studio</span>
        </a>

        {/* View Switcher: Studio vs Gallery */}
        <div className="hidden sm:flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => onViewModeChange('gallery')}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewMode === 'gallery'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Templates (116)
          </button>
          <button
            onClick={() => onViewModeChange('studio')}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewMode === 'studio'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2D CAD Studio
          </button>
        </div>

        {/* Current Template Switcher Pill */}
        {viewMode === 'studio' && (
          <button
            onClick={onOpenTemplates}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer group"
            title="Browse 100+ packaging templates"
          >
            <span className="text-slate-500">{categoryName}:</span>
            <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors truncate max-w-[180px]">
              {templateName}
            </span>
            <span className="text-[10px] text-slate-500 px-1 py-0.5 rounded bg-white border border-slate-200 font-mono">
              Change
            </span>
          </button>
        )}
      </div>

      {/* Zone 2: Navigation & Tool Controls */}
      <div className="flex items-center gap-2.5">
        {/* Unit Selector Segmented Control */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200 text-xs">
          {(['mm', 'cm', 'in'] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => onUnitChange(u)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                unit === u
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Saved Projects Button */}
        <button
          onClick={onOpenProjects}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          title="Saved Projects & Import JSON"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
          <span>Projects</span>
        </button>

        {/* User Authentication Status (Pacdora Inspired Top-Right Log In) */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs"
            >
              <img
                src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
              />
              <span className="font-semibold text-slate-800 max-w-[90px] truncate hidden sm:inline">
                {user.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs text-slate-700 animate-in fade-in duration-100">
                <div className="p-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[9px] font-semibold uppercase">
                    {user.provider} verified
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors font-medium text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => requireAuth(() => {})}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-xs transition-colors cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Log in</span>
          </button>
        )}
      </div>

      {/* Zone 3: Primary Action - Export Dieline */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all whitespace-nowrap cursor-pointer active:scale-98"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Dieline</span>
        </button>
      </div>
    </header>
  );
};
