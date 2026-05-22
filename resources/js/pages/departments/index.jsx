import DeleteEntityModal from '@/components/DeleteEntityModal';
import DepartmentTableActions from '@/components/departments/DepartmentTableActions';
import { GenericTable } from '@/components/GenericTable';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Trash2, UserCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';

export default function Departments({ departments, areas = [], filters = {} }) {
    const { flash } = usePage().props;

    // 1. Estados para los filtros (Búsqueda y Área)
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedArea, setSelectedArea] = useState(filters.area_id || '');

    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // 2. Referencia para evitar que el useEffect se dispare en la carga inicial
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // 3. Efecto para aplicar los filtros (con debounce de 300ms)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get(
                route('departments.index'),
                {
                    search: searchTerm,
                    area_id: selectedArea,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedArea]);

    const columns = [
        {
            header: 'ID',
            className: 'w-16',
            render: (dept) => <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{dept.id}</span>,
        },
        {
            header: 'Departamento',
            className: 'w-1/4',
            render: (dept) => <span className="font-semibold text-zinc-900 dark:text-zinc-50">{dept.name}</span>,
        },
        {
            header: 'Área',
            render: (dept) => (
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:bg-zinc-800">
                    {dept.area?.name || 'No asignada'}
                </span>
            ),
        },
        {
            header: 'Responsables',
            className: 'w-1/3',
            render: (dept) => (
                <div className="flex flex-wrap gap-1">
                    {dept.heads?.length > 0 ? (
                        dept.heads.map((head) => (
                            <span
                                key={head.id}
                                className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                            >
                                <UserCheck size={10} className="text-zinc-500" /> {head.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-sm text-zinc-400 italic">Sin asignar</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Correo',
            render: (dept) => <span className="text-sm text-zinc-600 dark:text-zinc-400">{dept.email_department}</span>,
        },
        {
            header: 'Acciones',
            className: 'text-right w-24',
            render: (dept) => (
                <DepartmentTableActions
                    department={dept}
                    onDelete={(d) => {
                        setSelectedDepartment(d);
                        setIsDeleteOpen(true);
                    }}
                />
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Departamentos" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Departamentos</h1>
                        <p className="text-sm text-zinc-500">Gestión de departamentos y asignación de jefaturas.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                            <Link href={route('departments.create')}>
                                <Plus className="mr-2 h-4 w-4" /> Nuevo
                            </Link>
                        </Button>

                        <Button variant="outline" asChild className="border-zinc-200 dark:border-zinc-800">
                            <Link href={route('departments.trashed')}>
                                <Trash2 className="mr-2 h-4 w-4" /> Ver Borrados
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 4. UI de Filtros y Búsqueda */}
                <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 md:flex-row md:items-center dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="relative w-full md:w-1/3">
                        <label htmlFor="search-departments" className="sr-only">
                            Buscar departamento
                        </label>

                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                        <Input
                            id="search-departments"
                            placeholder="Buscar por nombre o correo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-lg border-zinc-200 bg-white pl-9 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                    </div>

                    <div className="w-full md:w-1/4">
                        <label htmlFor="area-select" className="sr-only">
                            Filtrar por área
                        </label>

                        <select
                            id="area-select"
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
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
                </div>

                <GenericTable data={departments?.data || []} columns={columns} />

                <Pagination links={departments?.links || []} />
            </div>

            <DeleteEntityModal
                isOpen={isDeleteOpen}
                entity={selectedDepartment}
                entityType="Departamento"
                deleteEndpoint={route('departments.index')}
                closeModal={() => {
                    setIsDeleteOpen(false);
                    setSelectedDepartment(null);
                }}
            />
        </AppLayout>
    );
}
