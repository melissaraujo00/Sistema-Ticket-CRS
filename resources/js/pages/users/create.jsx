import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserActions } from '@/hooks/use-user-actions';
import { translateRoleName } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

export default function Create({ departments = [], roles = [], areas = [] }) {
    const { form, store } = useUserActions();
    const { data, setData, processing, errors } = form;

    const submit = (e) => {
        store(e);
    };

    // Filtrado reactivo: Solo departamentos que pertenecen al área seleccionada
    const filteredDepartments = departments.filter((dept) => dept.area_id == data.area_id);

    return (
        <AppLayout>
            <Head title="Nuevo Usuario" />
            <Toaster position="top-right" richColors />
            <form
                onSubmit={submit}
                className="flex w-full flex-1 flex-col overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
                <div className="flex items-center gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
                    <Button type="button" asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Link href={route('users.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Nuevo Usuario</h2>
                </div>

                <div className="flex flex-1 items-start justify-center overflow-y-auto p-8">
                    <div className="w-full max-w-2xl space-y-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-sm font-bold text-zinc-500">
                                    Nombre
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Nombre completo"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.name && <p className="text-xs font-medium text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="institution_code" className="text-sm font-bold text-zinc-500">
                                    Código Institucional <span className="font-normal text-zinc-400">(opcional)</span>
                                </Label>
                                <Input
                                    id="institution_code"
                                    placeholder="Ej: CRS-001"
                                    value={data.institution_code}
                                    onChange={(e) => setData('institution_code', e.target.value)}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.institution_code && <p className="text-xs font-medium text-red-500">{errors.institution_code}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-sm font-bold text-zinc-500">
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.email && <p className="text-xs font-medium text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-sm font-bold text-zinc-500">
                                    Contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.password && <p className="text-xs font-medium text-red-500">{errors.password}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="phone_number" className="text-sm font-bold text-zinc-500">
                                    Teléfono
                                </Label>
                                <Input
                                    id="phone_number"
                                    placeholder="00000000"
                                    value={data.phone_number}
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    maxLength={8}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.phone_number && <p className="text-xs font-medium text-red-500">{errors.phone_number}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="ext" className="text-sm font-bold text-zinc-500">
                                    Extensión <span className="font-normal text-zinc-400">(opcional)</span>
                                </Label>
                                <Input
                                    id="ext"
                                    placeholder="Ej: 101"
                                    value={data.ext}
                                    onChange={(e) => setData('ext', e.target.value)}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.ext && <p className="text-xs font-medium text-red-500">{errors.ext}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="birthdate" className="text-sm font-bold text-zinc-500">
                                    Fecha de nacimiento
                                </Label>
                                <Input
                                    id="birthdate"
                                    type="date"
                                    value={data.birthdate}
                                    onChange={(e) => setData('birthdate', e.target.value)}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.birthdate && <p className="text-xs font-medium text-red-500">{errors.birthdate}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="role" className="text-sm font-bold text-zinc-500">
                                    Rol
                                </Label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => {
                                        const newRole = e.target.value;
                                        setData((prev) => ({
                                            ...prev,
                                            role: newRole,
                                            is_head: newRole === 'admin' ? prev.is_head : false,
                                        }));
                                    }}
                                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/30 px-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200"
                                >
                                    <option value="">Selecciona un rol</option>
                                    {roles.map((role) => (
                                        <option key={role} value={role}>
                                            {translateRoleName(role)}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && <p className="text-xs font-medium text-red-500">{errors.role}</p>}
                            </div>

                            {/* Jerarquía: Área -> Departamento */}
                            <div className="space-y-3">
                                <Label htmlFor="area_id" className="text-sm font-bold text-zinc-500">
                                    Área
                                </Label>
                                <select
                                    id="area_id"
                                    value={data.area_id}
                                    onChange={(e) => {
                                        setData((prev) => ({ ...prev, area_id: e.target.value, department_id: '', is_head: false }));
                                    }}
                                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/30 px-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200"
                                >
                                    <option value="">Selecciona un área</option>
                                    {areas.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="department_id" className="text-sm font-bold text-zinc-500">
                                    Departamento
                                </Label>
                                <select
                                    id="department_id"
                                    value={data.department_id}
                                    onChange={(e) => setData('department_id', e.target.value)}
                                    disabled={!data.area_id}
                                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/30 px-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200"
                                >
                                    <option value="">{data.area_id ? 'Selecciona un departamento' : 'Primero selecciona un área'}</option>
                                    {filteredDepartments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.department_id && <p className="text-xs font-medium text-red-500">{errors.department_id}</p>}
                            </div>

                            {/* Toggle Condicional de Jefatura */}
                            {data.role === 'admin' && data.department_id && (
                                <div className="animate-in fade-in zoom-in-95 col-span-1 space-y-3 duration-200 md:col-span-2">
                                    <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                        <input
                                            type="checkbox"
                                            id="is_head"
                                            checked={data.is_head}
                                            onChange={(e) => setData('is_head', e.target.checked)}
                                            className="mt-1 h-5 w-5 cursor-pointer rounded border-zinc-300 text-zinc-900 shadow-sm focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-zinc-50"
                                        />
                                        <div className="flex flex-col">
                                            <Label htmlFor="is_head" className="cursor-pointer text-sm font-bold text-zinc-900 dark:text-zinc-50">
                                                Asignar como Jefe de este Departamento
                                            </Label>
                                            <span className="mt-1 text-sm text-zinc-500">
                                                Al marcar esta opción, el usuario será el responsable directo y podrá gestionar estadísticas y
                                                asignaciones del departamento.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-auto border-t border-zinc-100 p-6 dark:border-zinc-800 dark:bg-zinc-900/20">
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="ghost" asChild className="text-zinc-500">
                            <Link href={route('users.index')}>Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 rounded-xl bg-zinc-900 px-8 font-bold text-white shadow-lg shadow-zinc-900/10 transition-all active:scale-95"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear Usuario'}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
