import { Link, usePage } from '@inertiajs/react';
import React from 'react';

export default function TecnicoLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center border border-gray-200 p-1 mr-4 bg-white">
                                <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="100" height="100" fill="white"/>
                                    <path d="M40 10 H60 V40 H90 V60 H60 V90 H40 V60 H1  0 V40 H40 V10Z" fill="#E53935"/>
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <h1 className="text-xl sm:text-2xl font-bold text-red-600 tracking-tight">
                                    Sistema de Tickets
                                </h1>
                                <h2 className="text-lg sm:text-xl font-bold text-red-600 tracking-tight">
                                    Cruz Roja Salvadoreña
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right leading-tight hidden sm:block">
                                <div className="text-lg font-bold text-gray-900">{user?.name || 'Mateo Zelaya'}</div>
                                <div className="text-sm font-semibold text-gray-500">Tecnico</div>
                            </div>
                            <Link
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="text-red-500 hover:text-red-700 font-bold text-base underline underline-offset-4 decoration-2"
                            >
                                Cerrar Sesion
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {children}
            </main>
        </div>
    );
}
