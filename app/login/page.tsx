"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LogIn, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/admin")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-container/40 via-surface to-secondary-fixed/20 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-tertiary/10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image src="/img/logo.png" alt="AriFran Glamour" width={64} height={64} className="mx-auto" />
          </Link>
          <h1 className="font-display-lg text-headline-md text-primary tracking-tight mb-1">
            AriFran Glamour
          </h1>
          <p className="font-body-md text-on-surface-variant">Acesso ao Painel de Gestão</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-error-container text-error text-sm p-3 rounded-lg text-center font-label-bold">
              Credenciais inválidas. Verifique o seu e-mail e senha.
            </div>
          )}
          <div>
            <label className="block text-sm font-label-bold text-on-surface-variant mb-2">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-label-bold text-on-surface-variant mb-2">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-label-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {loading ? 'A verificar...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-on-surface-variant hover:text-secondary transition-colors">
            ← Voltar à Loja
          </Link>
        </div>
      </div>
    </div>
  )
}
