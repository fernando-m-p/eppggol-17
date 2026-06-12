import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'EPPGGol 17 – Bolão Copa do Mundo 2026',
  description: 'Palpites e classificação em tempo real do Bolão Copa do Mundo 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 glass-panel border-b border-emerald-950/60 shadow-lg shadow-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo / Branding */}
              <div className="flex items-center">
                <Link href="/ranking" className="flex items-center space-x-2 group">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                    <span className="text-black font-extrabold text-lg">17</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                      EPPGG<span className="text-emerald-400">Gol</span>
                    </span>
                    <span className="text-[10px] text-emerald-500/80 -mt-1 font-semibold tracking-wider uppercase">
                      Copa do Mundo 2026
                    </span>
                  </div>
                </Link>
              </div>

              {/* Navigation Links */}
              <nav className="flex space-x-1 sm:space-x-3">
                <Link
                  href="/tabela"
                  className="px-3.y py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-emerald-950/40 transition-all"
                >
                  Tabela da Copa
                </Link>
                <Link
                  href="/ranking"
                  className="px-3.y py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-emerald-950/40 transition-all"
                >
                  Leaderboard
                </Link>
                <Link
                  href="/admin"
                  className="px-3.y py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-emerald-950/40 transition-all border border-emerald-950/40"
                >
                  Painel Admin
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-emerald-950/40 py-6 mt-12 bg-black/20 text-center text-xs text-slate-500">
          <p>© 2026 EPPGGol 17. Todos os direitos reservados. Rumo à Copa do Mundo 2026! ⚽🏆</p>
        </footer>
      </body>
    </html>
  );
}
