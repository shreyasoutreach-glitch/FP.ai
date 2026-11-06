import { Outlet, NavLink } from 'react-router-dom'
import { Shield, BookOpen, Upload, Home } from 'lucide-react'

export default function Layout() {
  const navCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-fp-accent/20 text-fp-accent-glow border border-fp-accent/30'
        : 'text-fp-muted hover:text-fp-text hover:bg-fp-border'
    }`

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="border-b border-fp-border bg-fp-surface/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-fp-accent/20 border border-fp-accent/40 flex items-center justify-center group-hover:bg-fp-accent/30 transition-colors">
              <Shield className="w-4 h-4 text-fp-accent" />
            </div>
            <span className="font-bold text-fp-text tracking-tight">
              FP<span className="text-fp-accent">.ai</span>
            </span>
          </NavLink>

          <div className="flex items-center gap-1">
            <NavLink to="/" className={navCls} end>
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </NavLink>
            <NavLink to="/analysis" className={navCls}>
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analyse</span>
            </NavLink>
            <NavLink to="/knowledge" className={navCls}>
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Knowledge Base</span>
            </NavLink>
          </div>

          <div className="text-xs text-fp-muted font-mono hidden md:block">v1.0.0</div>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-fp-border bg-fp-surface/50 py-4 text-center text-xs text-fp-muted">
        FP.ai — Fine Print Engine &nbsp;·&nbsp; Not legal advice. For informational use only.
      </footer>
    </div>
  )
}
