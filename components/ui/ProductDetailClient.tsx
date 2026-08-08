"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Minus, Plus, ChevronLeft, ShieldCheck, Truck, Sparkles } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { ProductCard } from "@/components/ui/ProductCard"

interface Product {
  id: string
  name: string
  description: string | null
  image_url: string | null
  price_sale: number
  stock_current: number
  badge_text: string | null
  badge_type: string | null
  category: { name: string } | null
}

interface RelatedProduct {
  id: string
  name: string
  price_sale: number
  image_url: string | null
  badge_text: string | null
  badge_type: string | null
  category_id: string | null
}

interface ProductDetailClientProps {
  product: Product
  relatedProducts: RelatedProduct[]
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const isOutOfStock = product.stock_current <= 0
  const isLowStock = product.stock_current > 0 && product.stock_current <= 5

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-AO') + ' KZS'
  }

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(q => q - 1)
  }

  const handleIncrease = () => {
    if (quantity < product.stock_current) setQuantity(q => q + 1)
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_sale,
      imageUrl: product.image_url || '/img/logo.png'
    }, quantity)
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Link href="/shop" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-bold mb-8">
        <ChevronLeft className="w-4 h-4" /> Voltar à loja
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-24">
        {/* Lado Esquerdo: Imagem */}
        <div className="relative aspect-[4/5] md:aspect-square bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/20 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex items-center justify-center p-8">
          {product.image_url ? (
            <Image 
              src={product.image_url} 
              alt={product.name}
              fill
              className="object-contain p-8 hover:scale-105 transition-transform duration-700"
              priority
            />
          ) : (
            <Sparkles className="w-24 h-24 text-outline-variant" />
          )}
          
          {product.badge_text && (
            <span className={`absolute top-6 left-6 text-xs font-label-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${
              product.badge_type === 'new' ? 'bg-tertiary text-on-tertiary' : 
              product.badge_type === 'vegan' ? 'bg-primary text-white' : 
              'bg-secondary text-white'
            }`}>
              {product.badge_text}
            </span>
          )}
        </div>

        {/* Lado Direito: Info */}
        <div className="flex flex-col justify-center">
          {product.category && (
            <p className="text-secondary font-label-bold uppercase tracking-[0.2em] mb-3 text-sm">
              {product.category.name}
            </p>
          )}
          
          <h1 className="font-display-lg text-display-sm md:text-display-lg text-primary mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="text-display-sm text-on-surface mb-8">
            {formatPrice(product.price_sale)}
          </div>

          {product.description && (
            <p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="bg-surface-container/50 p-6 rounded-2xl mb-8 space-y-6">
            <div className="flex items-center gap-4">
              <span className="font-label-bold text-on-surface">Estado do Stock:</span>
              {isOutOfStock ? (
                <span className="text-error font-bold flex items-center gap-2">Esgotado</span>
              ) : isLowStock ? (
                <span className="text-tertiary font-bold">Apenas {product.stock_current} unidades disponíveis!</span>
              ) : (
                <span className="text-success font-bold">Em Stock</span>
              )}
            </div>

            {!isOutOfStock && (
              <div className="flex items-center gap-6">
                <span className="font-label-bold text-on-surface">Quantidade:</span>
                <div className="flex items-center bg-white border border-outline-variant/30 rounded-lg overflow-hidden h-12 shadow-sm">
                  <button onClick={handleDecrease} className="w-12 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-primary transition-colors disabled:opacity-50" disabled={quantity <= 1}>
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-label-bold">{quantity}</span>
                  <button onClick={handleIncrease} className="w-12 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-primary transition-colors disabled:opacity-50" disabled={quantity >= product.stock_current}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-5 rounded-xl font-label-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
              isOutOfStock 
                ? 'bg-surface-container text-outline-variant cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'
            }`}
          >
            <ShoppingCart className="w-6 h-6" />
            {isOutOfStock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
          </button>

          <div className="grid grid-cols-2 gap-4 mt-10 border-t border-outline-variant/20 pt-8">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <Truck className="w-5 h-5 text-tertiary" />
              <span className="text-sm font-label-bold">Entregas Rápidas</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <ShieldCheck className="w-5 h-5 text-tertiary" />
              <span className="text-sm font-label-bold">Compra Segura</span>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos Relacionados */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-outline-variant/20 pt-20">
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-display-lg text-headline-md text-primary">Também vai gostar</h2>
            <Link href={`/shop?category=${relatedProducts[0].category_id}`} className="text-secondary font-label-bold hover:underline">Ver categoria</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {relatedProducts.map(prod => (
              <ProductCard 
                key={prod.id} 
                id={prod.id}
                name={prod.name}
                price={prod.price_sale}
                imageUrl={prod.image_url || '/img/logo.png'}
                badge={prod.badge_text ? { text: prod.badge_text, type: (prod.badge_type as 'new' | 'vegan' | 'sale') || 'new' } : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
