/* global route */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserActions } from '@/hooks/use-user-actions';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { translateRoleName } from '@/hooks/usePermissions';

export default function Edit({ user, departments = [], roles = [] }) {
    const { form, update } = useUserActions(user);
    const { data, setData, processing, errors } = form;

    const submit = (e) => {
        update(e, user.id);
    };

    return (
        <AppLayout>
            <Head title="Editar Usuario" />
            <form
                onSubmit={submit}
                className="flex w-full flex-1 flex-col overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Link href={route('users.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Editar Usuario</h2>
                </div>

                {/* Body */}
                <div className="flex flex-1 items-start justify-center p-8">
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
                                <Label htmlFor="email" className="text-sm font-bold text-zinc-500">
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.email && <p className="text-xs font-medium text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="phone_number" className="text-sm font-bold text-zinc-500">
                                    Teléfono
                                </Label>
                                <Input
                                    id="phone_number"
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
                                <Label htmlFor="password" className="text-sm font-bold text-zinc-500">
                                    Nueva contraseña <span className="font-normal text-zinc-400">(opcional)</span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Déjala en blanco para conservar la actual"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.password && <p className="text-xs font-medium text-red-500">{errors.password}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="department_id" className="text-sm font-bold text-zinc-500">
                                    Departamento
                                </Label>
                                <select
                                    id="department_id"
                                    value={data.department_id}
                                    onChange={(e) => setData('department_id', e.target.value)}
                                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/30 px-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200"
                                >
                                    <option value="">Selecciona un departamento</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.department_id && <p className="text-xs font-medium text-red-500">{errors.department_id}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="role" className="text-sm font-bold text-zinc-500">
                                    Rol
                                </Label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
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
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto border-t border-zinc-100 p-6 dark:border-zinc-800 dark:bg-zinc-900/20">
                    <div className="flex items-center justify-end gap-4">
                        <Button variant="ghost" asChild className="text-zinc-500">
                            <Link href={route('users.index')}>Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 rounded-xl bg-zinc-900 px-8 font-bold text-white shadow-lg shadow-zinc-900/10 transition-all active:scale-95"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar Usuario'}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
