import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

// Importamos el mismo componente que se usa en la portada pública
import FaqSection from '@/components/Welcome/FaqSection';

export default function Index({ knowledges = [] }) {
    // Breadcrumbs para la barra superior
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Preguntas Frecuentes', href: '/faqs' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Centro de Ayuda" />

            <div className="flex h-full w-full flex-col p-4 md:p-6 lg:p-8">
                {/* Encabezado interno del módulo */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Preguntas Frecuentes</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Consulta la información sobre accesos, hardware, software y procesos operativos de la institución.
                    </p>
                </div>

                {/* Contenedor que reutiliza tu componente visual ya existente */}
                <div className="dark:bg-sidebar border-sidebar-border overflow-hidden rounded-xl border bg-white shadow-sm">
                    <FaqSection knowledges={knowledges} />
                </div>
            </div>
        </AppLayout>
    );
}
