import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "@/components/ui/ProductDetailClient"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Metadata } from "next"

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!product) {
    return {
      title: 'Produto não encontrado | AriFran Glamour',
    }
  }

  return {
    title: `${product.name} | AriFran Glamour`,
    description: product.description || `Compre ${product.name} na AriFran Glamour.`,
    openGraph: {
      title: product.name,
      description: product.description || `Compre ${product.name} na AriFran Glamour.`,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  // Buscar produtos relacionados da mesma categoria (excluindo o atual)
  let relatedProducts = []
  if (product.category_id) {
    const { data: related } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', product.category_id)
      .eq('is_active', true)
      .neq('id', id)
      .limit(4)
    
    relatedProducts = related || []
  }

  return (
    <>
      <Header />
      <main className="py-section-gap px-6 md:px-margin-desktop max-w-container-max mx-auto min-h-[70vh]">
        <ProductDetailClient 
          product={product} 
          relatedProducts={relatedProducts} 
        />
      </main>
      <Footer />
    </>
  )
}
