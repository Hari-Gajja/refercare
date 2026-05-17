import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type LayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Layout({ title, subtitle, children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user
    ? [
        { label: 'Referrals', to: '/specialist' },
        { label: 'Doctors', to: '/specialist/doctors' },
        { label: 'Logbook', to: '/specialist/logbook' },
      ]
    : [];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Medical Dental
            </p>
            <p className="text-lg font-semibold text-slate-900">Referral System</p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-2 sm:flex">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {user ? (
              <div className="hidden items-center gap-3 text-sm text-slate-600 sm:flex">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Specialist Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {children}
      </main>

      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white px-4 py-3 shadow-lg sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Log out
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
