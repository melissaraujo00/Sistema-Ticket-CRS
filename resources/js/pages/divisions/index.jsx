import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Divisions({ divisions, departments = [], filters = {} }) {
    const divisionList = divisions?.data ?? [];

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || '');

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get(
                route('divisions.index'),
                {
                    search: searchTerm,
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
    }, [searchTerm, selectedDepartment]);

    const deleteDivision = (division) => {
        if (confirm(`¿Seguro que deseas eliminar la división "${division.name}"?`)) {
            router.delete(route('divisions.destroy', division.id));
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedDepartment('');

        router.get(
            route('divisions.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const hasFilters = searchTerm || selectedDepartment;

    return (
        <AppLayout>
            <Head title="Divisiones" />

            <div className="space-y-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            Divisiones
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Gestión de divisiones vinculadas a departamentos.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                            <Link href={route('divisions.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva
                            </Link>
                        </Button>

                        <Button variant="outline" asChild className="border-zinc-200 dark:border-zinc-800">
                            <Link href={route('divisions.trashed')}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Ver Borradas
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Buscador y filtros */}
                <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 md:flex-row md:items-center dark:border-zinc-800 dark:bg-zinc-900/50">
                    {/* Buscador */}
                    <div className="relative w-full md:w-1/3">
                        <label htmlFor="search-divisions" className="sr-only">
                            Buscar división
                        </label>

                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                        <Input
                            id="search-divisions"
                            placeholder="Buscar división"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-lg border-zinc-200 bg-white pl-9 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                    </div>

                    {/* Filtro por departamento */}
                    <div className="w-full md:w-1/3">
                        <label htmlFor="department-select" className="sr-only">
                            Filtrar por departamento
                        </label>

                        <select
                            id="department-select"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                        >
                            <option value="">Todos los departamentos</option>

                            {departments.map((department) => (
                                <option key={department.id} value={department.id}>
                                    {department.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    
                </div>

                {/* Tabla */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-bold tracking-wider text-zinc-500 uppercase dark:border-zinc-800 dark:bg-zinc-900/50">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">División</th>
                                    <th className="px-6 py-4">Departamento</th>
                                    <th className="px-6 py-4">Área</th>
                                    <th className="px-6 py-4">Características</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {divisionList.length > 0 ? (
                                    divisionList.map((division) => (
                                        <tr
                                            key={division.id}
                                            className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                                        >
                                            <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">
                                                {division.id}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                                                    {division.name}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:bg-zinc-800">
                                                    {division.department?.name || 'Sin departamento'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="text-sm text-zinc-500">
                                                    {division.department?.area?.name || 'Sin área'}
                                                </span>
                                            </td>

                                            <td className="max-w-md px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                                {division.characteristics || (
                                                    <span className="italic text-zinc-400">
                                                        Sin características
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        className="h-8 w-8 rounded-full"
                                                    >
                                                        <Link href={route('divisions.edit', division.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteDivision(division)}
                                                        className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className="text-sm font-medium text-zinc-500">
                                                    No hay divisiones registradas.
                                                </p>

                                                <Button
                                                    asChild
                                                    className="mt-4 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900"
                                                >
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Paginador */}
                {divisions?.links && <Pagination links={divisions.links} />}
            </div>
        </AppLayout>
    );
}