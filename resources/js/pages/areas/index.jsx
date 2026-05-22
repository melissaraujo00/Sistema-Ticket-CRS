import AreaTableActions from '@/components/areas/AreaTableActions';
import DeleteEntityModal from '@/components/DeleteEntityModal';
import { GenericTable } from '@/components/GenericTable';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';

export default function Areas({ areas, filters = {} }) {
    const { flash } = usePage().props;

    // Estados del modal y búsqueda
    const [selectedArea, setSelectedArea] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Efecto de búsqueda con debounce
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get(route('areas.index'), { search: searchTerm }, { preserveState: true, preserveScroll: true, replace: true });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const columns = [
        {
            header: 'ID',
            className: 'w-16',
            render: (area) => <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{area.id}</span>,
        },
        {
            header: 'Nombre',
            className: 'w-1/3',
            render: (area) => <span className="font-semibold text-zinc-900 dark:text-zinc-50">{area.name}</span>,
        },
        {
            header: 'Descripción',
            render: (area) => <span className="text-sm text-zinc-600 dark:text-zinc-400">{area.description ?? 'Sin descripción'}</span>,
        },
        {
            header: 'Acciones',
            className: 'text-right w-24',
            render: (area) => (
                <AreaTableActions
                    area={area}
                    onDelete={(a) => {
                        setSelectedArea(a);
                        setIsDeleteOpen(true);
                    }}
                />
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Áreas" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Áreas</h1>
                        <p className="text-sm text-zinc-500">Lista de áreas registradas en el sistema.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                            <Link href={route('areas.create')}>
                                <Plus className="mr-2 h-4 w-4" /> Nuevo
                            </Link>
                        </Button>

                        <Button variant="outline" asChild className="border-zinc-200 dark:border-zinc-800">
                            <Link href={route('areas.trashed')}>
                                <Trash2 className="mr-2 h-4 w-4" /> Ver Borrados
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* UI de Búsqueda */}
                <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="relative w-full md:w-1/3">
                        <label htmlFor="search-areas" className="sr-only">
                            Buscar área
                        </label>
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            id="search-areas"
                            placeholder="Buscar por nombre o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-lg border-zinc-200 bg-white pl-9 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                    </div>
                </div>

                <GenericTable data={areas?.data || []} columns={columns} />
                <Pagination links={areas?.links || []} />
            </div>

            <DeleteEntityModal
                isOpen={isDeleteOpen}
                entity={selectedArea}
                entityType="Área"
                deleteEndpoint={route('areas.index')}
                closeModal={() => {
                    setIsDeleteOpen(false);
                    setSelectedArea(null);
                }}
            />
        </AppLayout>
    );
}
