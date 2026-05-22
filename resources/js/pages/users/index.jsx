import DeleteEntityModal from '@/components/DeleteEntityModal';
import { GenericTable } from '@/components/GenericTable';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserRoleBadge from '@/components/users/UserRoleBadge';
import UserTableActions from '@/components/users/UserTableActions';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Trash2, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';

export default function Users({ users, departments = [], roles = [], areas = [], filters = {} }) {
    const { flash } = usePage().props;

    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const { hasPermission, authUser } = usePermissions();

    // Estados inicializados con los filtros que vienen de la URL
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedArea, setSelectedArea] = useState(filters.area_id || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || '');

    // Ref para evitar que la búsqueda se dispare en el primer renderizado
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Lógica de filtrado en Backend con Debounce (Retraso de 300ms)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get(
                route('users.index'),
                {
                    search: searchTerm,
                    area_id: selectedArea,
                    department_id: selectedDepartment,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedArea, selectedDepartment]);

    // Departamentos filtrados para el Select (solo muestra los del área seleccionada)
    const filteredDepartments = departments.filter((dept) => dept.area_id == selectedArea);

    const allColumns = [
        {
            header: 'Usuario',
            className: 'w-1/3',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                        <User className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="block font-semibold text-zinc-900 dark:text-zinc-50">{user.name}</span>
                        <span className="text-xs text-zinc-500">{user.institution_code && `Cód: ${user.institution_code}`}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Contacto',
            className: 'hidden md:table-cell',
            render: (user) => (
                <div className="flex flex-col">
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{user.email}</span>
                    <span className="text-xs font-medium text-zinc-400">Tel: {user.phone_number}</span>
                </div>
            ),
        },
        {
            header: 'Departamento',
            className: 'hidden md:table-cell text-zinc-600 dark:text-zinc-400',
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
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
            className: 'text-right w-24',
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

    const columns = allColumns.filter((column) => {
        if (column.header === 'Acciones') return hasPermission('manage_users');
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
                        <div className="flex items-center gap-2">
                            <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                                <Link href={route('users.create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo
                                </Link>
                            </Button>

                            <Button variant="outline" asChild className="border-zinc-200 dark:border-zinc-800">
                                <Link href={route('users.trashed')}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Ver Inactivos
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Barra de Búsqueda y Filtros con Accesibilidad */}
                <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 md:flex-row md:items-center dark:border-zinc-800 dark:bg-zinc-900/50">
                    {/* Buscador de Texto */}
                    <div className="relative w-full md:w-1/3">
                        <label htmlFor="search-users" className="sr-only">
                            Buscar por nombre, código o correo
                        </label>
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            id="search-users"
                            placeholder="Buscar por nombre, código, correo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-lg border-zinc-200 bg-white pl-9 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                    </div>

                    {/* Filtro de Área */}
                    <div className="w-full md:w-1/4">
                        <label htmlFor="area-select" className="sr-only">
                            Filtrar por Área
                        </label>
                        <select
                            id="area-select"
                            value={selectedArea}
                            onChange={(e) => {
                                setSelectedArea(e.target.value);
                                setSelectedDepartment('');
                            }}
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                        >
                            <option value="">Todas las áreas</option>
                            {areas.map((area) => (
                                <option key={area.id} value={area.id}>
                                    {area.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro de Departamento */}
                    <div className="w-full md:w-1/4">
                        <label htmlFor="dept-select" className="sr-only">
                            Filtrar por Departamento
                        </label>
                        <select
                            id="dept-select"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            disabled={!selectedArea}
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                        >
                            <option value="">{selectedArea ? 'Todos los departamentos' : 'Selecciona un área primero'}</option>
                            {filteredDepartments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Pasamos users.data para conectarnos con la paginación del servidor */}
                <GenericTable data={users.data} columns={columns} />

                {/* Paginación nativa */}
                <Pagination links={users.links} />
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
