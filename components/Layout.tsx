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
  { view: 'matrix',  label: 'Matrix',   Icon: Grid },
  { view: 'bag',     label: 'The Bag',  Icon: ShoppingBag },
  { view: 'combine', label: 'Combine',  Icon: Crosshair },
];

export const Layout: React.FC<LayoutProps> = ({ view, onChangeView, children, hideNav }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col max-w-2xl mx-auto">
      {/* Top bar — sits below Dynamic Island / notch */}
      <header className="bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-10"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top))', paddingBottom: '12px' }}>
        <div className="flex items-center">
          <img src="/logo.png" alt="Dialed" className="h-7 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">{user?.name}</span>
          <button
            onClick={logout}
            title="Sign out"
            className="flex items-center justify-center w-9 h-9 text-gray-400 active:text-gray-600 rounded-xl active:bg-gray-100 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main content — pb-safe adds room for nav + home indicator */}
      <main className={`flex-1 overflow-y-auto ${hideNav ? '' : 'pb-safe'}`}>
        {children}
      </main>

      {/* Bottom nav — sits above home indicator */}
      {!hideNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-gray-100 flex z-10 safe-bottom"
        >
          {NAV_ITEMS.map(({ view: v, label, Icon }) => {
            const active = v === view;
            return (
              <button
                key={v}
                onClick={() => onChangeView(v)}
                className={`flex-1 flex flex-col items-center py-2.5 transition-colors active:bg-gray-50 ${
                  active ? 'text-[#4f6b35]' : 'text-gray-400'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[11px] mt-0.5 font-medium`}>{label}</span>
                {active && <span className="w-1 h-1 rounded-full bg-[#e59d4b] mt-0.5" />}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
