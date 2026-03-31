import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useHealth } from '@/contexts/HealthDataContext';
import { Switch } from '@/components/ui/switch';
import {
  LayoutDashboard, Clock, PlusCircle, Pill, Users, Calendar,
  BarChart3, BookOpen, FileDown, Menu, X, Stethoscope, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
  { to: '/log-symptom', icon: PlusCircle, label: 'Log Symptom' },
  { to: '/medications', icon: Pill, label: 'Medications' },
  { to: '/providers', icon: Users, label: 'Providers' },
  { to: '/visits', icon: Calendar, label: 'Visits' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/health-story', icon: BookOpen, label: 'Health Story' },
  { to: '/export', icon: FileDown, label: 'Export' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { doctorMode, setDoctorMode } = useHealth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold text-foreground">CareWeave</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Multi-Provider Health Timeline</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Doctor Mode</span>
            </div>
            <Switch checked={doctorMode} onCheckedChange={setDoctorMode} />
          </div>
        </div>
      </aside>

      {/* Mobile */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">CareWeave</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <Switch checked={doctorMode} onCheckedChange={setDoctorMode} />
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="lg:hidden bg-card border-b border-border p-3 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
