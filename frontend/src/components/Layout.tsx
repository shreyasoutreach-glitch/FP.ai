import { Outlet, NavLink } from 'react-router-dom'
import { Shield, BookOpen, Upload, Home } from 'lucide-react'

export default function Layout() {
  const navCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'border border-fp-accent/30 bg-fp-accent/10 text-fp-accent'
        : 'text-fp-muted hover:bg-fp-surface hover:text-fp-text'
    }`

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-fp-border/80 bg-fp-bg/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <NavLink to="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-fp-accent/30 bg-fp-accent/10 text-fp-accent transition-colors group-hover:bg-fp-accent/15">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight text-fp-text">
              FP<span className="text-fp-accent">.ai</span>
            </span>
          </NavLink>

          <div className="flex items-center gap-1">
            <NavLink to="/" className={navCls} end>
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Home</span>
            </NavLink>
            <NavLink to="/analysis" className={navCls}>
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analyse</span>
            </NavLink>
            <NavLink to="/knowledge" className={navCls}>
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Knowledge Base</span>
            </NavLink>
          </div>

          <span className="hidden text-xs text-fp-muted md:block">Contract intelligence</span>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-fp-border/80 bg-fp-bg/70 px-4 py-5 text-center text-xs text-fp-muted">
        FP.ai · Contract review support · Not legal advice
      </footer>
    </div>
  )
}
