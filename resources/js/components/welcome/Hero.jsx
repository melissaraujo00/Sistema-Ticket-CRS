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

                <div className="mx-auto max-w-xl relative">
                    <div className="flex items-center bg-white rounded-xl p-2 shadow-2xl">
                        <Search className="ml-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Busca un problema o pregunta..."
                            className="w-full border-none bg-transparent px-4 py-2 text-gray-900 focus:ring-0"
                        />
                        <button className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-bold">Buscar</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
