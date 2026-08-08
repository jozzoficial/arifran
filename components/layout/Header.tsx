"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Menu, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/context/CartContext"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchParams = useSearchParams()
  const initialQuery = searchParams?.get('q') || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const { cartCount, setIsCartOpen } = useCart()
  const router = useRouter()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(searchParams?.get('q') || "")
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 h-20 flex items-center transition-colors duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-surface shadow-[0px_10px_30px_rgba(0,0,0,0.05)]'}`}>
      <nav className="flex justify-between items-center px-6 md:px-margin-desktop w-full max-w-container-max mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/img/logo.jpeg" 
              alt="AriFran Glamour Logo" 
              width={48} 
              height={48} 
              className="h-12 w-auto"
            />
            <span className="font-display-lg text-headline-sm text-primary tracking-tight hidden sm:block">
              AriFran Glamour
            </span>
          </Link>
          <ul className="hidden md:flex gap-8">
            <li>
              <Link href="/shop" className="font-body-md text-secondary border-b-2 border-tertiary pb-1">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/#categorias" className="font-body-md text-on-surface-variant hover:text-secondary transition-colors duration-300">
                Categorias
              </Link>
            </li>
            <li>
              <Link href="/#sobre" className="font-body-md text-on-surface-variant hover:text-secondary transition-colors duration-300">
                Sobre Nós
              </Link>
            </li>
            <li>
              <Link href="/memories" className="font-body-md text-on-surface-variant hover:text-secondary transition-colors duration-300">
                Memórias
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar..." 
              className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 w-48 focus:ring-1 focus:ring-primary text-body-md outline-none transition-all focus:w-64" 
            />
          </form>
          <button 
            className="text-primary hover:scale-105 transition-transform active:scale-95 relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-label-bold w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            className="md:hidden text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-lg md:hidden z-50">
          <ul className="flex flex-col p-6 gap-4">
            <li>
              <Link href="/shop" className="font-body-md text-secondary" onClick={() => setMobileMenuOpen(false)}>
                Shop
              </Link>
            </li>
            <li>
              <Link href="/#categorias" className="font-body-md text-on-surface-variant" onClick={() => setMobileMenuOpen(false)}>
                Categorias
              </Link>
            </li>
            <li>
              <Link href="/#sobre" className="font-body-md text-on-surface-variant" onClick={() => setMobileMenuOpen(false)}>
                Sobre Nós
              </Link>
            </li>
            <li>
              <Link href="/memories" className="font-body-md text-on-surface-variant hover:text-secondary" onClick={() => setMobileMenuOpen(false)}>
                Memórias
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
