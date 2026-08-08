import { createClient } from "@/utils/supabase/server"
import { SalesClient } from "@/components/admin/SalesClient"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function SalesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [salesRes, productsRes] = await Promise.all([
    supabase.from('sales').select('*, products(name), profiles(full_name)').order('created_at', { ascending: false }),
    supabase.from('products').select('id, name, price_sale, stock_current').eq('is_active', true)
  ])

  return (
    <>
      <div className="mb-8">
        <p className="font-label-bold text-primary mb-1 uppercase tracking-[0.2em]">Ponto de Venda</p>
        <h2 className="font-display-lg text-headline-md text-on-surface">Registo de Vendas</h2>
      </div>
      
      <SalesClient 
        initialSales={salesRes.data || []} 
        products={productsRes.data || []} 
        userId={user.id} 
      />
    </>
  )
}
