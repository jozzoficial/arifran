"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, SlidersHorizontal, PackageOpen, ChevronDown } from "lucide-react"
import { ProductCard } from "@/components/ui/ProductCard"

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  price_sale: number
  image_url: string | null
  badge_text: string | null
  badge_type: string | null
}

interface ShopClientProps {
  categories: Category[]
  products: Product[]
}

export function ShopClient({ categories, products }: ShopClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCategory = searchParams.get('category') || 'all'
  const currentSort = searchParams.get('sort') || 'newest'
  const currentQuery = searchParams.get('q') || ''
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleCategoryChange = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (catId === 'all') {
      params.delete('category')
    } else {
      params.set('category', catId)
    }
    router.push(`/shop?${params.toString()}`)
    setIsMobileMenuOpen(false)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    router.push(`/shop?${params.toString()}`)
  }

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start animate-in fade-in duration-500">
      
      {/* Botão de Filtros Mobile */}
      <button 
        className="md:hidden w-full bg-surface-container flex items-center justify-between p-4 rounded-xl font-label-bold"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span className="flex items-center gap-2"><Filter className="w-5 h-5" /> Filtrar por Categoria</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Barra Lateral: Categorias */}
      <aside className={`w-full md:w-64 shrink-0 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:sticky md:top-24 shadow-sm ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
        <div className="flex items-center gap-2 mb-6 text-primary">
          <SlidersHorizontal className="w-5 h-5" />
          <h3 className="font-display-lg text-headline-sm">Categorias</h3>
        </div>
        
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => handleCategoryChange('all')}
              className={`w-full text-left px-4 py-3 rounded-lg font-label-bold transition-colors ${
                currentCategory === 'all' 
                  ? 'bg-secondary-container text-on-secondary-container' 
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              Ver Tudo
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <button 
                onClick={() => handleCategoryChange(cat.id)} // Usamos o ID porque no related products filtramos por category_id
                className={`w-full text-left px-4 py-3 rounded-lg font-label-bold transition-colors ${
                  currentCategory === cat.id 
                    ? 'bg-secondary-container text-on-secondary-container' 
                    : 'text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Área Principal: Produtos */}
      <div className="flex-1 w-full">
        {/* Barra de Topo: Ordenação e Contagem */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-4 rounded-xl border border-outline-variant/20 shadow-sm">
          <div>
            <p className="font-label-bold text-on-surface-variant">
              A mostrar <span className="text-primary font-bold">{products.length}</span> produtos
            </p>
            {currentQuery && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-on-surface-variant">Resultados da pesquisa para: <strong className="text-primary">&quot;{currentQuery}&quot;</strong></span>
                <button onClick={clearSearch} className="text-xs text-on-error bg-error hover:bg-error/90 px-2 py-1 rounded-md transition-colors ml-2 font-label-bold">Limpar Pesquisa</button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="sort" className="font-label-bold text-sm text-on-surface-variant whitespace-nowrap">Ordenar por:</label>
            <select 
              id="sort"
              value={currentSort} 
              onChange={handleSortChange}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 outline-none focus:border-primary text-sm font-label-bold w-full sm:w-auto cursor-pointer"
            >
              <option value="newest">Mais Recentes</option>
              <option value="price_asc">Preço: Mais barato</option>
              <option value="price_desc">Preço: Mais caro</option>
            </select>
          </div>
        </div>

        {/* Grelha de Produtos */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {products.map(product => (
              <ProductCard 
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price_sale}
                imageUrl={product.image_url || '/img/logo.png'}
                badge={product.badge_text ? { text: product.badge_text, type: (product.badge_type as 'new' | 'vegan' | 'sale') || 'new' } : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-2xl border border-tertiary/10">
            <PackageOpen className="w-20 h-20 text-outline-variant mx-auto mb-6" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">Nenhum produto encontrado</h2>
            <p className="text-on-surface-variant max-w-md mx-auto">
              Não encontrámos produtos para esta categoria. Tente limpar os filtros ou selecionar outra opção!
            </p>
            <button 
              onClick={() => handleCategoryChange('all')}
              className="mt-6 text-secondary font-label-bold hover:underline"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
