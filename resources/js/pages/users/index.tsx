import { useState } from 'react';
import UserRoleBadge from '@/components/users/UserRoleBadge';
import CreateUserModal from '@/components/users/CreateUserModal';
import DeleteUserModal from '@/components/users/DeleteUserModal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type User } from '@/types/user';

interface Department {
    id: number;
    name: string;
}

interface Props {
    users: User[];
    departments: Department[];
    roles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Usuarios', href: '/users' }];

export default function Index({ users, departments, roles }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    const closeDeleteModal = () => {
        setSelectedUser(null);
        setIsDeleteOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-7xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white-900">Lista de Usuarios</h1>
                        <p className="mt-1 text-sm text-gray-100">
                            Gestiona los miembros de tu equipo, sus roles y departamentos.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        Nuevo Usuario
                    </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Contacto</th>
                                    <th className="px-6 py-4">Departamento</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {users.map((user) => (
                                    <tr key={user.id} className="transition-colors hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="mt-0.5 text-xs text-gray-500">ID: {user.id}</div>
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-gray-900">{user.email}</div>
                                            <div className="mt-0.5 text-xs text-gray-500">
                                                Tel: {user.phone_number}
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                                            {user.department?.name ?? 'Sin asignar'}
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex gap-1">
                                                {user.roles?.map((role) => (
                                                    <UserRoleBadge key={role.id} role={role} />
                                                ))}
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                                                    user.is_active === 1
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : 'border-red-200 bg-red-50 text-red-700'
                                                }`}
                                            >
                                                <span
                                                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                                        user.is_active === 1
                                                            ? 'bg-emerald-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                />
                                                {user.is_active === 1 ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>

                                        <td className="space-x-4 whitespace-nowrap px-6 py-4 text-right font-medium">
                                            <button className="text-blue-600 transition-colors hover:text-blue-900">
                                                Editar
                                            </button>

                                            <button
                                                onClick={() => openDeleteModal(user)}
                                                className="text-red-600 transition-colors hover:text-red-900"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CreateUserModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                departments={departments}
                roles={roles}
            />

            <DeleteUserModal
                user={selectedUser}
                isOpen={isDeleteOpen}
                onClose={closeDeleteModal}
            />
        </AppLayout>
    );
}