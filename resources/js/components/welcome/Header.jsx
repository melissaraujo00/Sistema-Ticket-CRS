import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { CruzRojaLogo } from '@/components/CruzRojaLogo';
import { route } from 'ziggy-js';

export default function Header({ auth }) {
    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                <div className="flex items-center gap-4">
                    <CruzRojaLogo size="small" />
                    <div className="hidden sm:block border-l border-gray-200 pl-4">
                        <h1 className="text-sm font-bold tracking-widest text-gray-900 uppercase">
                            Gestión de Tickets
                        </h1>
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tighter">
                            Soporte Institucional
                        </p>
                    </div>
                </div>

                <nav className="flex items-center gap-4">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="group flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-gray-800 shadow-lg shadow-gray-200"
                        >
                            PANEL DE CONTROL
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="rounded-full bg-[#DA291C] px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#b82218] shadow-lg shadow-red-100"
                        >
                            INICIAR SESIÓN
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
