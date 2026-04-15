/* global route */
import DeleteEntityModal from '@/components/DeleteEntityModal';
import { GenericTable } from '@/components/GenericTable';
import { Button } from '@/components/ui/button';
import UserRoleBadge from '@/components/users/UserRoleBadge';
import UserTableActions from '@/components/users/UserTableActions';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Plus, User } from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'sonner';


export default function Users({ users = [], departments = [], roles = [] }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { hasPermission, authUser } = usePermissions();

    const allColumns = [
        {
            header: 'Usuario',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                        <User className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="block font-semibold">{user.name}</span>
                        <span className="text-xs text-zinc-400">ID: {user.id}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Contacto',
            className: 'hidden md:table-cell',
            render: (user) => (
                <div>
                    <span className="block text-sm">{user.email}</span>
                    <span className="text-xs text-zinc-400">Tel: {user.phone_number}</span>
                </div>
            ),
        },
        {
            header: 'Departamento',
            className: 'hidden md:table-cell text-zinc-600',
            render: (user) => <span className="text-sm">{user.department?.name ?? 'Sin asignar'}</span>,
        },
        {
            header: 'Rol',
            render: (user) => (
                <div className="flex flex-wrap gap-1">
                    {user.roles?.map((role) => (
                        <UserRoleBadge key={role.id} role={role} />
                    ))}
                </div>
            ),
        },
        {
            header: 'Estado',
            render: (user) => (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                        user.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {user.is_active ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            header: 'Acciones',
            className: 'text-right',
            render: (user) => (
                <UserTableActions
                    user={user}
                    authUser={authUser}
                    onDelete={(u) => {
                        setSelectedUser(u);
                        setIsDeleteOpen(true);
                    }}
                />
            ),
        },
    ];

    // Filtrar la columna de acciones si el usuario no tiene permisos
    const columns = allColumns.filter((column) => {
        if (column.header === 'Acciones') {
            return hasPermission('manage_users');
        }
        return true;
    });

    return (
        <AppLayout>
            <Head title="Usuarios" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Usuarios</h1>
                        <p className="text-sm text-zinc-500">Gestión de miembros del equipo, roles y departamentos.</p>
                    </div>

                    {hasPermission('manage_users') && (
                        <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                            <Link href={route('users.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo
                            </Link>
                        </Button>
                    )}
                </div>

                <GenericTable data={users} columns={columns} />
            </div>

            <DeleteEntityModal
                isOpen={isDeleteOpen}
                entity={selectedUser}
                entityType="Usuario"
                deleteEndpoint={route('users.index')}
                closeModal={() => {
                    setIsDeleteOpen(false);
                    setSelectedUser(null);
                }}
            />
        </AppLayout>
    );
}
