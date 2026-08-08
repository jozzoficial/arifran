import Link from "next/link"
import { MessageCircle, Mail, Music2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest py-section-gap border-t border-tertiary/30">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-6 md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-col gap-4">
          <Link href="/" className="font-display-lg text-headline-sm text-primary mb-2">
            AriFran Glamour
          </Link>
          <p className="font-body-md text-on-surface-variant">
            Elevando o padrão da beleza com produtos excepcionais e experiências inesquecíveis.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="text-primary hover:text-secondary transition-colors" title="TikTok">
              <Music2 className="w-5 h-5" />
            </a>
            <a href="#" className="text-primary hover:text-secondary transition-colors" title="WhatsApp">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="#" className="text-primary hover:text-secondary transition-colors" title="Email">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h5 className="font-label-bold text-on-surface uppercase tracking-widest mb-2">Shop</h5>
          <Link href="/shop" className="font-body-md text-on-surface-variant hover:text-tertiary transition-colors">Novidades</Link>
          <Link href="/shop" className="font-body-md text-on-surface-variant hover:text-tertiary transition-colors">Mais Vendidos</Link>
          <Link href="/shop" className="font-body-md text-on-surface-variant hover:text-tertiary transition-colors">Cuidados com a Pele</Link>
          <Link href="/shop" className="font-body-md text-on-surface-variant hover:text-tertiary transition-colors">Maquiagem</Link>
        </div>
        <div className="flex flex-col gap-4">
          <h5 className="font-label-bold text-on-surface uppercase tracking-widest mb-2">Empresa</h5>
          <Link href="/#sobre" className="font-body-md text-on-surface-variant hover:text-tertiary transition-colors">Sobre Nós</Link>
          <a href="#" className="font-body-md text-on-surface-variant hover:text-tertiary transition-colors">TikTok</a>
          <a href="#" className="font-body-md text-on-surface-variant hover:text-tertiary transition-colors">WhatsApp</a>
          <Link href="/login" className="font-body-md text-on-surface-variant hover:text-tertiary transition-colors">Área de Gestão</Link>
        </div>
        <div className="flex flex-col gap-4">
          <h5 className="font-label-bold text-on-surface uppercase tracking-widest mb-2">Newsletter</h5>
          <p className="font-body-md text-on-surface-variant mb-2">Assine para receber ofertas exclusivas e dicas de beleza.</p>
          <form className="flex flex-col gap-2">
            <input 
              type="email" 
              placeholder="E-mail" 
              className="bg-surface-container border border-outline-variant/30 rounded px-4 py-2 focus:ring-1 focus:ring-primary outline-none" 
            />
            <button 
              type="submit" 
              className="bg-primary text-white py-2 rounded font-label-bold uppercase text-xs tracking-widest hover:bg-secondary transition-colors active:scale-95"
            >
              Subscrever
            </button>
          </form>
        </div>
      </div>
      <div className="mt-20 pt-8 border-t border-outline-variant/10 text-center">
        <p className="font-label-sm text-on-surface-variant opacity-80">
          © {new Date().getFullYear()} AriFran Glamour. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
