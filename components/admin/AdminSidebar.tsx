"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, Package, ShoppingCart, ClipboardCheck, 
  BarChart3, LogOut, Menu, X, ChevronRight, Camera, Users, Store, Settings
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, roles: ['superadmin', 'admin', 'funcionario'] },
  { href: "/admin/storefront", label: "Montra", icon: Store, roles: ['superadmin'] },
  { href: "/admin/stock", label: "Stock", icon: Package, roles: ['superadmin', 'admin'] },
  { href: "/admin/sales", label: "Vendas", icon: ShoppingCart, roles: ['superadmin', 'admin', 'funcionario'] },
  { href: "/admin/memories", label: "Memórias", icon: Camera, roles: ['superadmin', 'admin'] },
  { href: "/admin/approvals", label: "Aprovações", icon: ClipboardCheck, roles: ['superadmin', 'admin', 'funcionario'] },
  { href: "/admin/finance", label: "Finanças", icon: BarChart3, roles: ['superadmin'] },
  { href: "/admin/team", label: "Equipa", icon: Users, roles: ['superadmin'] },
  { href: "/admin/settings", label: "Definições", icon: Settings, roles: ['superadmin'] },
]

interface AdminSidebarProps {
  userName: string
  userRole: string
}

export function AdminSidebar({ userName, userRole }: AdminSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const roleLabel = userRole === 'superadmin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Funcionária'

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-surface-container-lowest p-2 rounded-lg shadow-md border border-outline-variant/30"
      >
        <Menu className="w-5 h-5 text-primary" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        h-full w-64 fixed left-0 top-0 bg-surface-container border-r border-outline-variant/30 
        flex flex-col p-4 gap-2 z-50 transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        {/* Close button (mobile) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 md:hidden text-on-surface-variant"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="mb-8 px-2 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Image src="/img/logo.png" alt="AriFran Glamour" width={48} height={48} className="w-12 h-12 object-contain" />
            <div>
              <h1 className="font-display-lg text-headline-sm text-primary leading-tight">AriFran</h1>
              <p className="font-label-sm text-on-surface-variant opacity-70">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.filter(item => item.roles.includes(userRole)).map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container translate-x-1'
                    : 'text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-label-bold text-label-bold">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="mt-auto p-4 bg-surface-container-low rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-label-bold text-label-bold text-on-surface truncate">{userName}</p>
            <p className="text-[10px] uppercase tracking-wider text-outline">{roleLabel}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-on-surface-variant hover:text-primary transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
