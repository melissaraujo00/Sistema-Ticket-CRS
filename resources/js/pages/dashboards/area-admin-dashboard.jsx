import { BarChart3, Clock, Construction, ShieldCheck, Users } from 'lucide-react';

export default function AreaAdminDashboard() {
    return (
        <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Encabezado Informativo */}
                <div className="overflow-hidden border border-zinc-200 bg-white shadow-sm sm:rounded-lg dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="p-8 text-center">
                        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                            <Construction className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">Panel de Administración de Área</h1>
                        <p className="mx-auto max-w-2xl text-zinc-600 italic dark:text-zinc-400">
                            "Este espacio está siendo diseñado para centralizar la supervisión técnica y la gestión de rendimiento de los equipos de
                            auxilio y soporte."
                        </p>
                    </div>
                </div>

                {/* Sección de Próximas Funcionalidades */}
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <FeatureCard
                        icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
                        title="Métricas de Equipo"
                        description="Visualización de tasas de resolución y tiempos de respuesta promedio por agente."
                    />
                    <FeatureCard
                        icon={<Users className="h-6 w-6 text-green-500" />}
                        title="Gestión de Carga"
                        description="Monitoreo en tiempo real de tickets asignados vs. tickets en proceso por área."
                    />
                    <FeatureCard
                        icon={<Clock className="h-6 w-6 text-amber-500" />}
                        title="Control de SLA"
                        description="Alertas tempranas sobre tickets que están por vencer según el plan de servicio."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="h-6 w-6 text-purple-500" />}
                        title="Auditoría de Diagnósticos"
                        description="Revisión de soluciones aplicadas por los técnicos para asegurar la calidad del servicio."
                    />
                </div>

                {/* Nota de Desarrollo */}
                <div className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-zinc-100 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                    <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
                        Módulo en desarrollo para el ciclo 01-2026. La lógica de filtrado por área se conectará con el middleware de permisos.
                    </p>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4">{icon}</div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
        </div>
    );
}
