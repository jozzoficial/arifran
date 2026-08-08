import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { StorefrontClient } from "@/components/admin/StorefrontClient"

export const dynamic = 'force-dynamic'

export default async function StorefrontPage() {
  const supabase = await createClient()

  // 1. Verificar Autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Verificar Permissões (Apenas superadmin)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="text-error text-6xl mb-4">🚫</div>
        <h2 className="font-display-lg text-headline-md text-on-surface mb-2">Acesso Restrito</h2>
        <p className="text-on-surface-variant">Apenas o Super Admin tem permissões para gerir a montra da loja.</p>
      </div>
    )
  }

  // 3. Carregar Banners
  const { data: banners } = await supabase
    .from('hero_banners')
    .select('*')
    .order('display_order', { ascending: true })

  // 4. Carregar Categorias
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <>
      <div className="mb-8">
        <p className="font-label-bold text-primary mb-1 uppercase tracking-[0.2em]">Gestão</p>
        <h2 className="font-display-lg text-headline-md text-on-surface">Montra da Loja</h2>
        <p className="text-on-surface-variant mt-2">
          Gira as categorias de produtos e os banners da página inicial.
        </p>
      </div>

      <StorefrontClient 
        initialBanners={banners || []} 
        initialCategories={categories || []} 
      />
    </>
  )
}
