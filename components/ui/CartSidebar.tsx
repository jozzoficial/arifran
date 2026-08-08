"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/context/CartContext"
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"

export function CartSidebar() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart()
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'whatsapp_number')
        .single()
      
      if (data) {
        setWhatsappNumber(data.value)
      }
    }
    fetchSettings()
  }, [])

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-AO') + ' KZS'
  }

  const handleCheckout = () => {
    if (!whatsappNumber) {
      alert("Número de WhatsApp não configurado.")
      return
    }

    let message = "Olá AriFran Glamour! Gostaria de fazer a seguinte encomenda:\n\n"
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}\n`
    })
    
    message += `\n*Total: ${formatPrice(cartTotal)}*`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
    clearCart()
    setIsCartOpen(false)
  }

  if (!isCartOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)} 
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h2 className="font-display-lg text-headline-sm text-on-surface">O Seu Carrinho</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-outline hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
              <ShoppingBag className="w-16 h-16" />
              <p className="font-body-lg text-on-surface-variant">O seu carrinho está vazio.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-primary font-label-bold underline underline-offset-4"
              >
                Continuar a comprar
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 items-center bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20">
                <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-white shrink-0 border border-outline-variant/10">
                  <Image 
                    src={item.imageUrl || '/placeholder.png'} 
                    alt={item.name} 
                    fill 
                    className="object-contain p-2"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-label-bold text-on-surface truncate">{item.name}</h4>
                  <p className="font-body-md text-secondary mt-1">{formatPrice(item.price)}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-outline-variant/30 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-surface-container text-on-surface-variant rounded-l-lg transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-body-md text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-surface-container text-on-surface-variant rounded-r-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-outline-variant hover:text-error transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-outline-variant/30 p-6 bg-surface-container-lowest">
            <div className="flex justify-between items-center mb-6">
              <span className="font-body-lg text-on-surface-variant">Total Estimado</span>
              <span className="font-display-lg text-headline-sm text-secondary">{formatPrice(cartTotal)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95"
            >
              Finalizar no WhatsApp
            </button>
            <p className="text-center text-xs text-on-surface-variant mt-3 font-body-md">
              O pagamento será combinado diretamente com a nossa equipa.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
