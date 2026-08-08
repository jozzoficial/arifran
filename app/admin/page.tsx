import { createClient } from "@/utils/supabase/server"
import { Calendar, Wallet, Landmark, TrendingUp, Package, AlertTriangle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Buscar dados em paralelo
  const [salesRes, expensesRes, productsRes, approvalsRes] = await Promise.all([
    supabase.from('sales').select('total, created_at'),
    supabase.from('expenses').select('amount, expense_type'),
    supabase.from('products').select('id, name, stock_current, price_sale, price_purchase, image_url').eq('is_active', true),
    supabase.from('pending_approvals').select('id').eq('status', 'pending'),
  ])

  const sales = salesRes.data ?? []
  const expenses = expensesRes.data ?? []
  const products = productsRes.data ?? []
  const pendingCount = approvalsRes.data?.length ?? 0

  // Calcular métricas
  const grossRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const netProfit = grossRevenue - totalExpenses
  const lowStockProducts = products.filter(p => p.stock_current <= 10)

  const formatKZS = (value: number) => value.toLocaleString('pt-AO') + ' KZS'

  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <p className="font-label-bold text-label-bold text-primary mb-1 uppercase tracking-[0.2em]">Visão Interna</p>
          <h2 className="font-display-lg text-headline-md text-on-surface">Painel de Controlo</h2>
        </div>
        <div className="bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/30 flex items-center gap-3">
          <Calendar className="w-4 h-4 text-tertiary" />
          <span className="font-label-bold text-label-bold capitalize">{today}</span>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
        {/* Receita Bruta */}
        <div className="bento-card bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>
          <h3 className="font-label-bold text-label-bold text-outline uppercase tracking-wider mb-2">Receita Bruta</h3>
          <p className="font-display-lg text-headline-md text-on-surface">{formatKZS(grossRevenue)}</p>
          <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4" />
          </div>
        </div>

        {/* Despesas Totais */}
        <div className="bento-card bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-secondary" />
            </div>
          </div>
          <h3 className="font-label-bold text-label-bold text-outline uppercase tracking-wider mb-2">Despesas Totais</h3>
          <p className="font-display-lg text-headline-md text-on-surface">{formatKZS(totalExpenses)}</p>
          <p className="mt-4 font-body-md text-on-surface-variant text-sm">Inclui renda fixa e variáveis.</p>
        </div>

        {/* Lucro Líquido */}
        <div className="bento-card bg-primary p-8 rounded-xl shadow-[0px_10px_30px_rgba(121,84,101,0.2)] text-on-primary">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-full bg-on-primary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-on-primary" />
            </div>
          </div>
          <h3 className="font-label-bold text-label-bold text-on-primary/70 uppercase tracking-wider mb-2">Lucro Líquido</h3>
          <p className="font-display-lg text-headline-md">{formatKZS(netProfit)}</p>
          <div className="mt-4 flex gap-1">
            <div className="h-1 flex-1 bg-on-primary/20 rounded-full" />
            <div className="h-1 flex-1 bg-on-primary/20 rounded-full" />
            <div className="h-1 flex-1 bg-on-primary/60 rounded-full" />
            <div className="h-1 flex-1 bg-on-primary/20 rounded-full" />
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-12">
        {/* Low Stock Alert */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-error" />
            <h3 className="font-label-bold text-label-bold text-on-surface uppercase tracking-wider">Stock Baixo</h3>
          </div>
          {lowStockProducts.length > 0 ? (
            <ul className="space-y-3">
              {lowStockProducts.map(p => (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="text-on-surface-variant">{p.name}</span>
                  <span className="text-error bg-error-container px-3 py-1 rounded-full text-xs font-bold">
                    {p.stock_current} unid.
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-on-surface-variant text-sm">Todos os produtos têm stock adequado ✓</p>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-tertiary" />
            <h3 className="font-label-bold text-label-bold text-on-surface uppercase tracking-wider">Resumo Rápido</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Produtos activos</span>
              <span className="font-label-bold text-primary">{products.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Vendas realizadas</span>
              <span className="font-label-bold text-primary">{sales.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Aprovações pendentes</span>
              <span className={`font-label-bold ${pendingCount > 0 ? 'text-tertiary' : 'text-primary'}`}>
                {pendingCount}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
