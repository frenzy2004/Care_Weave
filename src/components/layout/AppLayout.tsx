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
  const { doctorMode, setDoctorMode, patient } = useHealth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/80 backdrop-blur-xl">
        {/* Logo header with gradient */}
        <div className="p-6 border-b border-border relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-[0.06]" />
          <div className="relative flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary shadow-md">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">CareWeave</h1>
              <p className="text-[11px] text-muted-foreground">Health Timeline</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'gradient-primary text-white shadow-md glow-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Patient info & Doctor Mode */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-teal flex items-center justify-center text-white text-xs font-bold">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{patient.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{patient.conditions[0]}</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Doctor Mode</span>
            </div>
            <Switch checked={doctorMode} onCheckedChange={setDoctorMode} />
          </div>
        </div>
      </aside>

      {/* Mobile */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground">CareWeave</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <Switch checked={doctorMode} onCheckedChange={setDoctorMode} />
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground p-1 rounded-lg hover:bg-accent transition-colors">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="lg:hidden bg-card/95 backdrop-blur-xl border-b border-border p-3 space-y-0.5 animate-fade-in">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'gradient-primary text-white shadow-md'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8 overflow-auto dot-pattern">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
