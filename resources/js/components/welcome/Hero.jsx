import React from 'react';
import { Search } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-gray-900 py-20 text-white">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-[#DA291C] blur-3xl"></div>
                <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#002F6C] blur-3xl"></div>
            </div>

            <div className="relative mx-auto max-w-7xl px-6 text-center">
                <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold tracking-[2px] uppercase backdrop-blur-sm">
                    Base de Conocimientos
                </span>
                <h2 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                    ¿Cómo podemos <span className="text-[#DA291C]">ayudarte</span> hoy?
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400">
                    Accede a soluciones rápidas, guías de usuario y canales de soporte directo para la Cruz Roja Salvadoreña.
                </p>
            </div>
        </section>
    );
}
