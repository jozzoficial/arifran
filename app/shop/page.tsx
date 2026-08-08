import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ShopClient } from "@/components/ui/ShopClient"
import { createClient } from "@/utils/supabase/server"

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>
}

export default async function Shop({ searchParams }: PageProps) {
  const params = await searchParams
  const categoryId = params.category || 'all'
  const sort = params.sort || 'newest'
  const queryText = params.q || ''

  const supabase = await createClient()

  // 1. Fetch categories
  const { data: categoriesRes } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  const categories = categoriesRes || []

  // 2. Fetch products with filter
  let query = supabase.from('products').select('*').eq('is_active', true)

  if (categoryId !== 'all') {
    query = query.eq('category_id', categoryId)
  }

  if (queryText) {
    query = query.or(`name.ilike.%${queryText}%,description.ilike.%${queryText}%`)
  }

  // 3. Apply sorting
  if (sort === 'price_asc') {
    query = query.order('price_sale', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('price_sale', { ascending: false })
  } else {
    // newest (default)
    query = query.order('created_at', { ascending: false })
  }

  const { data: productsRes } = await query
  const products = productsRes || []

  return (
    <>
      <Header />
      <main className="py-12 bg-surface min-h-screen">
        <div className="px-6 md:px-margin-desktop w-full max-w-container-max mx-auto">
          <h1 className="font-display-lg text-headline-md md:text-display-lg-mobile text-primary mb-8">Catálogo de Produtos</h1>
          
          <ShopClient 
            categories={categories} 
            products={products} 
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
