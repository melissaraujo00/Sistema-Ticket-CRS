import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { CruzRojaLogo } from '../components/CruzRojaLogo';
import { ChevronDown, ChevronUp, HelpCircle, Phone, Mail, Clock } from 'lucide-react';

export default function Welcome() {
    const { auth, knowledges } = usePage().props;
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const toggleFAQ = (id) => {
        setExpandedFAQ(expandedFAQ === id ? null : id);
    };

    // Categorías únicas
    const categoriasUnicas = Array.from(
        new Set(knowledges.map((item) => item.category.name))
    );

    return (
        <div className="min-h-screen bg-white">
            <Head title="Centro de Ayuda" />

            {/* Header */}
            <header className="border-b-2 border-[#A7B1B7] bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
                    <div className="flex items-center gap-6">
                        <CruzRojaLogo size="small" />
                        <div>
                            <h1 className="text-[20px] font-bold tracking-tight">SISTEMA DE GESTIÓN DE TICKETS</h1>
                            <p className="font-sans text-[13px] text-[#A7B1B7]">Soporte Técnico Institucional</p>
                        </div>
                    </div>

                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="bg-[#002F6C] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#001f47]"
                        >
                            IR AL DASHBOARD
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="bg-[#DA291C] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#c02418]"
                        >
                            INICIAR SESIÓN
                        </Link>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-[#002F6C] py-16 text-white">
                <div className="mx-auto max-w-7xl px-8 text-center">
                    <h2 className="mb-4 text-[32px] font-bold tracking-tight">CENTRO DE AYUDA Y SOPORTE TÉCNICO</h2>
                    <p className="mx-auto mb-8 max-w-3xl text-[16px] leading-relaxed opacity-90">
                        Encuentre respuestas a las preguntas más frecuentes sobre el uso del sistema de gestión de tickets de la Cruz Roja
                        Salvadoreña.
                    </p>
                </div>
            </section>

            {/* Contact Info */}
            <section className="bg-opacity-10 border-b-2 border-[#A7B1B7] bg-[#A7B1B7]">
                <div className="mx-auto max-w-7xl px-8 py-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <ContactItem icon={<Phone />} title="TELÉFONO DE SOPORTE" desc="Ext. 1500 (Lunes a Viernes)" />
                        <ContactItem icon={<Mail />} title="CORREO ELECTRÓNICO" desc="soporte@cruzroja.org.sv" />
                        <ContactItem icon={<Clock />} title="HORARIO DE ATENCIÓN" desc="8:00 AM - 5:00 PM" />
                    </div>
                </div>
            </section>

            {/* Preguntas Frecuentes */}
            <section className="py-16">
                <div className="mx-auto max-w-5xl px-8">
                    <div className="mb-12 text-center">
                        <div className="mb-4 flex justify-center">
                            <CruzRojaLogo size="large" />
                        </div>
                        <h2
                            className="mb-3"
                            style={{
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '28px',
                                fontWeight: 'bold',
                                letterSpacing: '0.5px',
                            }}
                        >
                            PREGUNTAS FRECUENTES
                        </h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#A7B1B7' }}>
                            Respuestas a las consultas más comunes sobre el sistema
                        </p>
                    </div>

                    {/* FAQs por categoría */}
                    {categoriasUnicas.map((categoria) => (
                        <div key={categoria} className="mb-8">
                            <h3
                                className="mb-4 border-b-2 border-[#002F6C] pb-2"
                                style={{
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#002F6C',
                                }}
                            >
                                {categoria.toUpperCase()}
                            </h3>
                            <div className="space-y-3">
                                {knowledges
                                    .filter((item) => item.category.name === categoria)
                                    .map((faq) => (
                                        <div key={faq.id} className="border-2 border-[#A7B1B7] bg-white">
                                            <button
                                                onClick={() => toggleFAQ(faq.id)}
                                                className="hover:bg-opacity-5 flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[#A7B1B7]"
                                            >
                                                <span
                                                    style={{
                                                        fontFamily: 'Poppins, sans-serif',
                                                        fontSize: '15px',
                                                        fontWeight: '600',
                                                        flex: 1,
                                                        paddingRight: '16px',
                                                    }}
                                                >
                                                    {faq.title}
                                                </span>
                                                {expandedFAQ === faq.id ? (
                                                    <ChevronUp className="h-5 w-5 flex-shrink-0 cursor-pointer text-[#002F6C]" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 flex-shrink-0 cursor-pointer text-[#002F6C]" />
                                                )}
                                            </button>

                                            {expandedFAQ === faq.id && (
                                                <div
                                                    className="border-t-2 border-[#A7B1B7] px-5 pt-4 pb-5"
                                                    style={{
                                                        backgroundColor: '#002F6C0A',
                                                    }}
                                                >
                                                    <p
                                                        style={{
                                                            fontFamily: 'Poppins, sans-serif',
                                                            fontSize: '14px',
                                                            lineHeight: '1.6',
                                                            color: '#000000',
                                                        }}
                                                    >
                                                        {faq.content_response}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black py-12 text-center text-white">
                <p className="text-[12px] opacity-70">© 2026 Cruz Roja Salvadoreña - Sistema de Soporte</p>
            </footer>
        </div>
    );
}

// Sub-componente
function ContactItem({ icon, title, desc }) {
    return (
        <div className="flex items-start gap-4">
            <div className="p-3 bg-[#002F6C] text-white">{icon}</div>
            <div>
                <h3 className="font-bold text-[14px] mb-1">{title}</h3>
                <p className="text-[13px] text-gray-500">{desc}</p>
            </div>
        </div>
    );
}
