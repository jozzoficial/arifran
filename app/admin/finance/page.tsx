import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { FinanceClient } from "@/components/admin/FinanceClient"

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="font-display-lg text-headline-md text-error mb-4">Acesso Negado 🚫</h1>
        <p className="text-on-surface-variant font-body-lg">
          Apenas o Super Admin tem acesso às finanças e despesas da loja.
        </p>
      </div>
    )
  }

  // Buscar TODOS os dados (o filtro por mês é feito no client)
  const [salesRes, expensesRes] = await Promise.all([
    supabase
      .from('sales')
      .select('*, products(name), profiles(full_name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  return (
    <>
      <div className="mb-8">
        <p className="font-label-bold text-primary mb-1 uppercase tracking-[0.2em]">Relatórios</p>
        <h2 className="font-display-lg text-headline-md text-on-surface">Gestão Financeira</h2>
      </div>

      <FinanceClient
        allSales={salesRes.data || []}
        allExpenses={expensesRes.data || []}
      />
    </>
  )
}
