import { createClient } from "@/utils/supabase/server"
import { StockClient } from "@/components/admin/StockClient"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function StockPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'funcionario') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="font-display-lg text-headline-md text-error mb-4">Acesso Negado 🚫</h1>
        <p className="text-on-surface-variant font-body-lg">
          Não tem permissões para aceder à Gestão de Stock.
        </p>
      </div>
    )
  }

  // Busca todos os produtos (incluindo inativos) e categorias
  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name')
  ])

  const products = productsRes.data ?? []
  const categories = categoriesRes.data ?? []

  return (
    <StockClient 
      initialProducts={products} 
      categories={categories}
      userRole={profile?.role || 'funcionario'} 
    />
  )
}
