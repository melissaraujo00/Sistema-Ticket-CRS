import React from 'react';
import { CruzRojaLogo } from '@/components/CruzRojaLogo';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-12">
            <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-6">
                <CruzRojaLogo size="small" className="opacity-50 grayscale" />
                <div className="text-center">
                    <p className="text-[11px] font-bold tracking-[2px] text-gray-400 uppercase">
                        © 2026 Cruz Roja Salvadoreña
                    </p>
                    <p className="mt-1 text-[10px] text-gray-300 uppercase">
                        Unidad de Informática y Sistemas
                    </p>
                </div>
            </div>
        </footer>
    );
}
