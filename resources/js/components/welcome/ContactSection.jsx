import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import ContactCard from './ContactCard';

export default function ContactSection() {
    return (
        <section className="-translate-y-12">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <ContactCard
                        icon={<Phone className="text-[#DA291C]" />}
                        title="Llamada Directa"
                        desc="Extensión 1500"
                        sub="Lunes a Viernes"
                    />
                    <ContactCard
                        icon={<Mail className="text-[#002F6C]" />}
                        title="Soporte Digital"
                        desc="soporte@cruzroja.org.sv"
                        sub="Respuesta en menos de 24h"
                    />
                    <ContactCard
                        icon={<Clock className="text-gray-600" />}
                        title="Horario de Oficina"
                        desc="8:00 AM - 5:00 PM"
                        sub="Atención Presencial/Remota"
                    />
                </div>
            </div>
        </section>
    );
}
