"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { ClipboardCheck, Plus, Save, XCircle, CheckCircle2, Loader2, DollarSign } from "lucide-react"

interface Approval {
  id: string
  table_name: string
  action: string
  new_data: any
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  requester?: { full_name: string } | null
}

interface ApprovalsClientProps {
  initialApprovals: Approval[]
  userRole: string
  userId: string
}

export function ApprovalsClient({ initialApprovals, userRole, userId }: ApprovalsClientProps) {
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [loading, setLoading] = useState<string | boolean>(false)
  
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: 0
  })

  const supabase = createClient()

  const formatKZS = (value: number) => Number(value).toLocaleString('pt-AO') + ' KZS'

  const handleRequestExpense = async () => {
    setLoading('request')
    const { data, error } = await supabase.from('pending_approvals').insert({
      table_name: 'expenses',
      action: 'insert',
      requested_by: userId,
      new_data: {
        description: expenseData.description,
        amount: expenseData.amount,
        expense_type: 'variable'
      }
    }).select(`*, requester:profiles!pending_approvals_requested_by_fkey(full_name)`).single()

    if (error) {
      alert("Erro ao criar pedido: " + error.message)
    } else if (data) {
      setApprovals([data, ...approvals])
      setShowRequestForm(false)
      setExpenseData({ description: '', amount: 0 })
      alert("Pedido enviado para aprovação com sucesso!")
    }
    setLoading(false)
  }

  const handleAction = async (approvalId: string, action: 'approve' | 'reject', newData: any) => {
    setLoading(approvalId)
    
    try {
      if (action === 'approve' && newData) {
        // 1. Criar a despesa nas finanças
        const { error: expenseError } = await supabase.from('expenses').insert({
          description: newData.description,
          amount: newData.amount,
          expense_type: newData.expense_type || 'variable',
          created_by: userId
        })
        
        if (expenseError) throw expenseError
      }

      // 2. Atualizar o estado da aprovação
      const { error: updateError } = await supabase.from('pending_approvals').update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: userId
      }).eq('id', approvalId)

      if (updateError) throw updateError

      setApprovals(approvals.map(a => a.id === approvalId ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a))
      
    } catch (err: any) {
      alert("Erro ao processar o pedido: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {userRole === 'funcionario' && (
        <div className="mb-8 flex justify-end">
          <button 
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-bold text-label-bold hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Novo Pedido de Despesa
          </button>
        </div>
      )}

      {showRequestForm && (
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/30 mb-8 animate-in slide-in-from-top-4">
          <h3 className="font-headline-sm text-primary mb-4">Pedir Despesa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Motivo / Descrição</label>
              <input 
                value={expenseData.description} 
                onChange={e => setExpenseData({...expenseData, description: e.target.value})} 
                placeholder="Ex: Compra de rolos de papel"
                className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Montante (KZS)</label>
              <input 
                type="number" 
                value={expenseData.amount} 
                onChange={e => setExpenseData({...expenseData, amount: Number(e.target.value)})} 
                className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setShowRequestForm(false)} className="px-4 py-2 text-on-surface-variant hover:text-error transition-colors">Cancelar</button>
            <button 
              onClick={handleRequestExpense}
              disabled={!expenseData.description || expenseData.amount <= 0 || loading === 'request'}
              className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-bold hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {loading === 'request' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Submeter Pedido
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/30">
        {approvals.length > 0 ? (
          <ul className="space-y-4">
            {approvals.map(app => {
              const isManager = userRole === 'admin' || userRole === 'superadmin'
              const isPending = app.status === 'pending'
              const statusColor = app.status === 'approved' ? 'text-success bg-success/10' : app.status === 'rejected' ? 'text-error bg-error/10' : 'text-tertiary bg-tertiary/10'

              return (
                <li key={app.id} className="border-l-4 border-outline-variant bg-surface-container/30 p-6 rounded-r-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-label-bold text-lg mb-1 flex items-center gap-2">
                      {app.table_name === 'expenses' ? <DollarSign className="w-4 h-4 text-primary" /> : <ClipboardCheck className="w-4 h-4 text-primary" />}
                      {app.new_data?.description || `${app.table_name} (${app.action})`}
                    </h4>
                    {app.new_data?.amount && (
                      <p className="font-display-lg text-secondary my-2">{formatKZS(app.new_data.amount)}</p>
                    )}
                    <p className="text-sm text-on-surface-variant">
                      Pedido por <span className="font-label-bold text-on-surface">{app.requester?.full_name || 'Sistema'}</span> em {new Date(app.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                      {app.status === 'pending' ? 'Pendente' : app.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </span>

                    {isManager && isPending && (
                      <div className="flex gap-2 w-full md:w-auto mt-2">
                        <button 
                          onClick={() => handleAction(app.id, 'reject', app.new_data)}
                          disabled={loading === app.id}
                          className="flex-1 md:flex-none border border-error/50 text-error hover:bg-error/10 px-4 py-2 rounded-lg font-label-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Rejeitar
                        </button>
                        <button 
                          onClick={() => handleAction(app.id, 'approve', app.new_data)}
                          disabled={loading === app.id}
                          className="flex-1 md:flex-none bg-success text-white hover:shadow-lg hover:bg-success/90 px-4 py-2 rounded-lg font-label-bold flex items-center justify-center gap-1 transition-all"
                        >
                          {loading === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} 
                          Aprovar
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="text-center py-16">
            <ClipboardCheck className="w-16 h-16 text-outline-variant mx-auto mb-4" />
            <h3 className="font-headline-sm text-headline-sm mb-2">Tudo em dia!</h3>
            <p className="text-on-surface-variant">Nenhuma aprovação pendente de momento.</p>
          </div>
        )}
      </div>
    </>
  )
}
