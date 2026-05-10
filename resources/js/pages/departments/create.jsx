import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDepartmentActions } from '@/hooks/use-department-actions';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Create({ areas = [] }) {
    const { form, store } = useDepartmentActions();
    const { data, setData, processing, errors } = form;

    const submit = (e) => {
        store(e);
    };

    return (
        <AppLayout>
            <Head title="Nuevo Departamento" />

            <form
                onSubmit={submit}
                className="flex w-full flex-1 flex-col overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
                    <Button type="button" asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Link href={route('departments.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Nuevo Departamento</h2>
                </div>

                {/* Body */}
                <div className="flex flex-1 items-start justify-center p-8">
                    <div className="w-full max-w-2xl space-y-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            {/* Nombre del Departamento */}
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-sm font-bold text-zinc-500">
                                    Nombre del Departamento
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Ej: Desarrollo Backend"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.name && <p className="text-xs font-medium text-red-500">{errors.name}</p>}
                            </div>

                            {/* Correo Electrónico */}
                            <div className="space-y-3">
                                <Label htmlFor="email_department" className="text-sm font-bold text-zinc-500">
                                    Correo del Departamento
                                </Label>
                                <Input
                                    id="email_department"
                                    type="email"
                                    placeholder="departamento@nextask.com"
                                    value={data.email_department}
                                    onChange={(e) => setData('email_department', e.target.value)}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.email_department && <p className="text-xs font-medium text-red-500">{errors.email_department}</p>}
                            </div>

                            {/* Selector de Área */}
                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="area_id" className="text-sm font-bold text-zinc-500">
                                    Área a la que pertenece
                                </Label>
                                <select
                                    id="area_id"
                                    value={data.area_id}
                                    onChange={(e) => setData('area_id', e.target.value)}
                                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/30 px-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200"
                                >
                                    <option value="">Selecciona un área...</option>
                                    {areas.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.area_id && <p className="text-xs font-medium text-red-500">{errors.area_id}</p>}
                            </div>

                            {/* Descripción */}
                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="description" className="text-sm font-bold text-zinc-500">
                                    Descripción
                                </Label>
                                <textarea
                                    id="description"
                                    placeholder="Describe brevemente las funciones de este departamento..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/30 p-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200"
                                />
                                {errors.description && <p className="text-xs font-medium text-red-500">{errors.description}</p>}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto border-t border-zinc-100 p-6 dark:border-zinc-800 dark:bg-zinc-900/20">
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="ghost" asChild className="text-zinc-500">
                            <Link href={route('departments.index')}>Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 rounded-xl bg-zinc-900 px-8 font-bold text-white shadow-lg shadow-zinc-900/10 transition-all active:scale-95"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear Departamento'}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
