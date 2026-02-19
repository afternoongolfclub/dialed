import React from 'react';
import { AppView } from '../types.ts';
import { Grid, ShoppingBag, Crosshair, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';

interface LayoutProps {
  view: AppView;
  onChangeView: (v: AppView) => void;
  children: React.ReactNode;
  hideNav?: boolean;
}

const NAV_ITEMS: { view: AppView; label: string; Icon: React.ElementType }[] = [
  { view: 'matrix',  label: 'Matrix', Icon: Grid },
  { view: 'bag',     label: 'The Bag', Icon: ShoppingBag },
  { view: 'combine', label: 'Combine', Icon: Crosshair },
];

export const Layout: React.FC<LayoutProps> = ({ view, onChangeView, children, hideNav }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col max-w-2xl mx-auto">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <img src="/icon.svg" alt="" className="w-7 h-7" />
          <span className="font-bold text-[#4f6b35] text-lg tracking-tight">dialed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">{user?.name}</span>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-gray-100 px-2 py-1 flex z-10">
          {NAV_ITEMS.map(({ view: v, label, Icon }) => {
            const active = v === view;
            return (
              <button
                key={v}
                onClick={() => onChangeView(v)}
                className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-colors ${
                  active
                    ? 'text-[#4f6b35]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[10px] mt-0.5 font-medium ${active ? 'text-[#4f6b35]' : ''}`}>
                  {label}
                </span>
                {active && (
                  <span className="w-1 h-1 rounded-full bg-[#e59d4b] mt-0.5" />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
