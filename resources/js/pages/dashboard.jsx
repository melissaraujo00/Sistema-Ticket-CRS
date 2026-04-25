import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

// Importamos todos los dashboards disponibles
import SuperAdminDashboard from '../pages/dashboards/super-admin-dashboard';
import AgentDashboard from '../pages/dashboards/agent-dashboard';
import UserDashboard from '../pages/dashboards/user-dashboard'; // Asegúrate de tener este importado
import AreaAdminDashboard from '../pages/dashboards/area-admin-dashboard';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' }
];

export default function Dashboard() {
    // Obtenemos la información del usuario autenticado
    const { auth } = usePage().props;

    // Obtenemos el arreglo de roles (ej: ['superadmin'] o ['agent'])
    const userRoles = auth?.user?.roles || [];

    // Función para determinar el rol principal (por si un usuario tiene varios roles)
    // Le damos prioridad de arriba hacia abajo
    const getPrimaryRole = () => {
        if (userRoles.includes('superadmin')) return 'superadmin';
        if (userRoles.includes('admin')) return 'admin';
        if (userRoles.includes('agent')) return 'agent';
        if (userRoles.includes('user')) return 'user';

        return 'default'; // Si no tiene ningún rol asignado
    };

    // Usamos el switch para renderizar el componente correcto
    const renderContent = () => {
        const role = getPrimaryRole();

        switch (role) {
            case 'superadmin':
                return <SuperAdminDashboard />;

            case 'admin':
                return <AreaAdminDashboard />;

            case 'agent':
                return <AgentDashboard />;

            case 'user':
                return <UserDashboard />;

            default:
                // Vista de seguridad en caso de que el usuario no tenga rol
                return (
                    <div className="flex h-full items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-gray-900">Acceso Restringido</h2>
                            <p className="text-gray-500">No tienes un rol asignado para ver el panel.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-4 md:p-6 lg:p-8 w-full flex flex-col h-full">
                {renderContent()}
            </div>
        </AppLayout>
    );
}
