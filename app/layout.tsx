import { type ReactNode } from "react"
import { Montserrat, Playfair_Display } from "next/font/google"
import { CartProvider } from "@/context/CartContext"
import { CartSidebar } from "@/components/ui/CartSidebar"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
})

export const metadata = {
  title: "AriFran Glamour | Cosméticos de Luxo",
  description: "Descubra uma curadoria exclusiva de cosméticos premium que celebram a sua identidade única com sofisticação e cuidado.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${playfairDisplay.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <CartProvider>
          {children}
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  )
}
