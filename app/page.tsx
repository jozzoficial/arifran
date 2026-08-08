import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProductCard } from "@/components/ui/ProductCard"
import { Button } from "@/components/ui/Button"
import { Truck, ShieldCheck, Headphones, PackageOpen, Star, Sparkles } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export const dynamic = 'force-dynamic'

// Mapeamento de nomes de ícones (da BD) para componentes Lucide
const iconMap: Record<string, React.ElementType> = {
  'truck': Truck,
  'shield-check': ShieldCheck,
  'headphones': Headphones,
  'star': Star,
  'sparkles': Sparkles,
}

export default async function Home() {
  const supabase = await createClient()

  // Buscar tudo em paralelo
  const [heroRes, categoriesRes, productsRes, featuresRes] = await Promise.all([
    supabase.from('hero_banners').select('*').eq('is_active', true).order('display_order').limit(1).single(),
    supabase.from('categories').select('*').eq('is_active', true).order('display_order'),
    supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(4),
    supabase.from('features').select('*').eq('is_active', true).order('display_order'),
  ])

  const hero = heroRes.data
  const categories = categoriesRes.data ?? []
  const products = productsRes.data ?? []
  const features = featuresRes.data ?? []

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        {hero && (
          <section className="relative w-full h-[85vh] flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div 
                className="bg-cover bg-center w-full h-full transform scale-105" 
                style={{ backgroundImage: `url('${hero.image_url}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
            </div>
            
            <div className="relative z-10 px-6 md:px-margin-desktop w-full max-w-container-max mx-auto">
              <div className="max-w-2xl">
                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6 leading-tight">
                  {hero.title}
                </h1>
                {hero.subtitle && (
                  <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">
                    {hero.subtitle}
                  </p>
                )}
                <div className="flex gap-4 flex-wrap">
                  <Link href={hero.cta_link || '/shop'}>
                    <Button variant="gradient" size="lg">{hero.cta_text || 'Comprar Agora'}</Button>
                  </Link>
                  <Link href="/#categorias">
                    <Button variant="primary" size="lg">Explorar Coleção</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <section id="categorias" className="py-section-gap px-6 md:px-margin-desktop w-full max-w-container-max mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display-lg text-headline-md text-primary mb-2">Nossas Categorias</h2>
              <div className="w-24 h-1 bg-tertiary/30 mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="flex flex-col items-center group cursor-pointer">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-primary-container overflow-hidden mb-6 flex items-center justify-center p-4">
                    {cat.image_url && (
                      <Image src={cat.image_url} alt={cat.name} width={200} height={200} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500" />
                    )}
                  </div>
                  <span className="font-label-bold text-on-surface group-hover:text-secondary transition-colors uppercase tracking-widest">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section className="py-section-gap bg-surface-container-low">
          <div className="px-6 md:px-margin-desktop w-full max-w-container-max mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-display-lg text-headline-md text-primary mb-2">Novidades</h2>
                <p className="font-body-md text-on-surface-variant">Os mais recentes da nossa loja</p>
              </div>
              <Link href="/shop" className="text-secondary font-label-bold hover:underline">Ver tudo</Link>
            </div>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    id={product.id}
                    name={product.name}
                    price={product.price_sale}
                    imageUrl={product.image_url || '/img/logo.png'}
                    badge={product.badge_text ? { text: product.badge_text, type: product.badge_type || 'new' } : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-tertiary/10">
                <PackageOpen className="w-16 h-16 text-outline-variant mx-auto mb-4" />
                <p className="font-headline-sm text-headline-sm text-on-surface-variant mb-2">Produtos em breve!</p>
                <p className="text-on-surface-variant">A nossa loja está a ser preparada com os melhores cosméticos para si.</p>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        {features.length > 0 && (
          <section id="sobre" className="py-section-gap px-6 md:px-margin-desktop w-full max-w-container-max mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter border-y border-tertiary/10 py-16">
              {features.map((feature, index) => {
                const IconComponent = iconMap[feature.icon_name] || Star
                return (
                  <div key={feature.id} className={`flex flex-col items-center text-center px-6 ${index > 0 && index < features.length - 1 ? 'md:border-x border-tertiary/10' : ''}`}>
                    <IconComponent className="w-12 h-12 text-secondary mb-6" />
                    <h4 className="font-label-bold text-on-surface mb-3 uppercase tracking-wider">{feature.title}</h4>
                    <p className="font-body-md text-on-surface-variant">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
