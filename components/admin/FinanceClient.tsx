"use client"

import { useState, useMemo } from "react"
import { FileSpreadsheet, FileText, TrendingDown, TrendingUp, Wallet, Landmark, Calendar, Loader2, ShoppingCart } from "lucide-react"
import { exportToExcel, exportToPDF } from "@/utils/exportReport"

interface Sale {
  id: string
  quantity: number
  unit_price: number
  total: number
  created_at: string
  products: { name: string } | null
  profiles: { full_name: string } | null
}

interface Expense {
  id: string
  description: string
  amount: number
  expense_type: string
  is_recurring: boolean
  created_at: string
}

interface FinanceClientProps {
  allSales: Sale[]
  allExpenses: Expense[]
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function FinanceClient({ allSales, allExpenses }: FinanceClientProps) {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  // Filtrar dados pelo mês/ano seleccionado
  const filteredSales = useMemo(() => {
    return allSales.filter(sale => {
      const d = new Date(sale.created_at)
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
    })
  }, [allSales, selectedMonth, selectedYear])

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(exp => {
      // Despesas recorrentes aparecem em todos os meses
      if (exp.is_recurring) return true
      const d = new Date(exp.created_at)
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
    })
  }, [allExpenses, selectedMonth, selectedYear])

  // Métricas calculadas
  const grossRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total), 0)
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const netProfit = grossRevenue - totalExpenses
  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`

  // Gerar anos disponíveis (do mais antigo ao actual)
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    years.add(now.getFullYear())
    allSales.forEach(s => years.add(new Date(s.created_at).getFullYear()))
    allExpenses.forEach(e => years.add(new Date(e.created_at).getFullYear()))
    return Array.from(years).sort((a, b) => b - a)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSales, allExpenses])

  const formatKZS = (value: number) =>
    Number(value).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' KZS'

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

  // ---- Handlers de exportação ----
  const handleExportExcel = async () => {
    setExporting('excel')
    try {
      await exportToExcel({
        sales: filteredSales,
        expenses: filteredExpenses,
        monthLabel,
        grossRevenue,
        totalExpenses,
        netProfit,
      })
    } catch (err) {
      console.error('Erro ao exportar Excel:', err)
      alert('Erro ao gerar o ficheiro Excel.')
    }
    setExporting(null)
  }

  const handleExportPDF = () => {
    setExporting('pdf')
    try {
      exportToPDF({
        sales: filteredSales,
        expenses: filteredExpenses,
        monthLabel,
        grossRevenue,
        totalExpenses,
        netProfit,
      })
    } catch (err) {
      console.error('Erro ao exportar PDF:', err)
      alert('Erro ao gerar o ficheiro PDF.')
    }
    setExporting(null)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ---- Selector de Mês + Botões de Exportação ---- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-tertiary" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-outline-variant/30 rounded-lg px-3 py-2 text-sm font-label-bold outline-none focus:ring-2 focus:ring-primary bg-white cursor-pointer"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx} value={idx}>{name}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-outline-variant/30 rounded-lg px-3 py-2 text-sm font-label-bold outline-none focus:ring-2 focus:ring-primary bg-white cursor-pointer"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportExcel}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1D6F42] text-white rounded-lg font-label-bold shadow-md hover:bg-[#1D6F42]/90 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {exporting === 'excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Exportar Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-lg font-label-bold shadow-md hover:bg-[#D32F2F]/90 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {exporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Exportar PDF
          </button>
        </div>
      </div>

      {/* ---- Cards de Resumo ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Receita Bruta */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/10 relative overflow-hidden hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-primary/40" />
          </div>
          <h3 className="font-label-bold text-outline uppercase tracking-wider mb-2">Faturamento Bruto</h3>
          <p className="font-display-lg text-headline-sm text-on-surface">{formatKZS(grossRevenue)}</p>
          <p className="mt-3 text-xs text-on-surface-variant">{filteredSales.length} vendas em {monthLabel}</p>
        </div>

        {/* Despesas Totais */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/10 hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
              <Landmark className="w-5 h-5 text-error" />
            </div>
            <TrendingDown className="w-5 h-5 text-error/40" />
          </div>
          <h3 className="font-label-bold text-outline uppercase tracking-wider mb-2">Despesas Totais</h3>
          <p className="font-display-lg text-headline-sm text-error">{formatKZS(totalExpenses)}</p>
          <p className="mt-3 text-xs text-on-surface-variant">{filteredExpenses.length} despesas (incl. recorrentes)</p>
        </div>

        {/* Lucro Líquido */}
        <div className={`p-8 rounded-xl shadow-lg hover:-translate-y-1 transition-transform ${netProfit >= 0 ? 'bg-primary text-on-primary' : 'bg-error text-on-error'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="font-label-bold text-white/70 uppercase tracking-wider mb-2">Lucro Líquido</h3>
          <p className="font-display-lg text-headline-sm text-white">{formatKZS(netProfit)}</p>
          <p className="mt-3 text-xs text-white/60">{monthLabel}</p>
        </div>
      </div>

      {/* ---- Tabela de Vendas ---- */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/30">
        <div className="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
          <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Vendas do Mês
          </h3>
          <span className="bg-secondary-container/30 text-secondary font-label-bold text-xs px-3 py-1 rounded-full">
            {filteredSales.length} vendas
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container text-on-surface-variant font-label-bold text-[11px] uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Data / Hora</th>
                <th className="px-8 py-4">Produto</th>
                <th className="px-8 py-4">Vendedor</th>
                <th className="px-8 py-4 text-center">Qtd</th>
                <th className="px-8 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                    Nenhuma venda registada em {monthLabel}.
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-primary-container/5 transition-colors">
                    <td className="px-8 py-4 text-sm text-on-surface-variant">{formatDate(sale.created_at)}</td>
                    <td className="px-8 py-4 font-label-bold text-on-surface">{sale.products?.name || 'Removido'}</td>
                    <td className="px-8 py-4 text-sm text-on-surface-variant">{sale.profiles?.full_name || 'Desconhecido'}</td>
                    <td className="px-8 py-4 text-center font-label-bold">{sale.quantity}</td>
                    <td className="px-8 py-4 text-right font-label-bold text-secondary">+{formatKZS(Number(sale.total))}</td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredSales.length > 0 && (
              <tfoot>
                <tr className="bg-primary text-on-primary">
                  <td colSpan={4} className="px-8 py-4 font-label-bold text-right uppercase tracking-wider">Total do Mês</td>
                  <td className="px-8 py-4 text-right font-display-lg text-headline-sm">{formatKZS(grossRevenue)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ---- Tabela de Despesas ---- */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/30">
        <div className="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
          <h3 className="font-headline-sm text-headline-sm text-error flex items-center gap-2">
            <TrendingDown className="w-5 h-5" /> Despesas do Mês
          </h3>
          <span className="bg-error-container text-error font-label-bold text-xs px-3 py-1 rounded-full">
            {filteredExpenses.length} despesas
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container text-on-surface-variant font-label-bold text-[11px] uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Descrição</th>
                <th className="px-8 py-4 text-center">Tipo</th>
                <th className="px-8 py-4 text-center">Recorrente</th>
                <th className="px-8 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-on-surface-variant">
                    Nenhuma despesa registada em {monthLabel}.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-error-container/5 transition-colors">
                    <td className="px-8 py-4 font-label-bold text-on-surface">{exp.description}</td>
                    <td className="px-8 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        exp.expense_type === 'fixed'
                          ? 'bg-tertiary-container/30 text-on-tertiary-container'
                          : 'bg-secondary-container/20 text-secondary'
                      }`}>
                        {exp.expense_type === 'fixed' ? 'Fixo' : 'Variável'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center text-sm text-on-surface-variant">
                      {exp.is_recurring ? '🔁 Sim' : 'Não'}
                    </td>
                    <td className="px-8 py-4 text-right font-label-bold text-error">
                      -{formatKZS(Number(exp.amount))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredExpenses.length > 0 && (
              <tfoot>
                <tr className="bg-error text-on-error">
                  <td colSpan={3} className="px-8 py-4 font-label-bold text-right uppercase tracking-wider">Total Despesas</td>
                  <td className="px-8 py-4 text-right font-display-lg text-headline-sm">{formatKZS(totalExpenses)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
