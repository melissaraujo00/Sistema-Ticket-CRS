import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { Department } from '@/types/department';
import type { RoleName } from '@/types/role';
import type { UserFormData } from '@/types/user';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    departments: Department[];
    roles: RoleName[];
}

type FormErrors = Partial<Record<keyof UserFormData, string>>;

function Field({
    label,
    error,
    optional,
    children,
}: {
    label: string;
    error?: string;
    optional?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {label}
                {optional && (
                    <span className="ml-1.5 normal-case tracking-normal font-normal text-slate-400/60">
                        (opcional)
                    </span>
                )}
            </label>
            {children}
            {error && (
                <p className="text-xs text-rose-400 mt-0.5">{error}</p>
            )}
        </div>
    );
}

const inputClass =
    'w-full rounded-md bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100';

export default function CreateUserModal({
    isOpen,
    onClose,
    departments,
    roles,
}: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<UserFormData>({
        name: '',
        email: '',
        password: '',
        phone_number: '',
        ext: null,
        birthdate: '',
        department_id: null,
        role: '',
    });

    const [formError, setFormError] = useState<string | null>(null);
    const [customErrors, setCustomErrors] = useState<FormErrors>({});

    const validateForm = () => {
        const newErrors: FormErrors = {};

        const allEmpty =
            !data.name.trim() &&
            !data.email.trim() &&
            !data.password.trim() &&
            !data.phone_number.trim() &&
            !data.birthdate.trim() &&
            !data.department_id &&
            !data.role;

        if (allEmpty) {
            setFormError('Debes completar el formulario antes de guardar.');
            setCustomErrors({});
            return false;
        }

        setFormError(null);

        if (!data.name.trim()) newErrors.name = 'El nombre es obligatorio';

        if (!data.email.trim()) {
            newErrors.email = 'El correo electrónico es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Ingresa un correo electrónico válido';
        }

        if (!data.password.trim()) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (data.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!data.phone_number.trim()) {
            newErrors.phone_number = 'El teléfono es obligatorio';
        } else if (!/^\d+$/.test(data.phone_number)) {
            newErrors.phone_number = 'El teléfono solo debe contener números';
        } else if (data.phone_number.length !== 8) {
            newErrors.phone_number = 'El teléfono debe tener exactamente 8 dígitos';
        }

        if (!data.birthdate.trim()) newErrors.birthdate = 'La fecha de nacimiento es obligatoria';
        if (!data.department_id) newErrors.department_id = 'Debes seleccionar un departamento';
        if (!data.role) newErrors.role = 'Debes seleccionar un rol';

        setCustomErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearErrors();
        const isValid = validateForm();
        if (!isValid) return;

        post('/users', {
            onSuccess: () => {
                reset();
                setCustomErrors({});
                setFormError(null);
                onClose();
            },
            onError: () => setFormError(null),
        });
    };

    const handleClose = () => {
        reset();
        clearErrors();
        setCustomErrors({});
        setFormError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">

                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-slate-100">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                            Gestión de usuarios
                        </p>
                        <h2 className="text-lg font-semibold text-slate-800">Nuevo usuario</h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-7 py-6">
                    {formError && (
                        <div className="mb-5 flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-100 px-4 py-3">
                            <svg className="mt-0.5 shrink-0 text-rose-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-sm text-rose-600">{formError}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Nombre" error={customErrors.name || errors.name}>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={inputClass}
                                placeholder="Juan Pérez"
                            />
                        </Field>

                        <Field label="Correo electrónico" error={customErrors.email || errors.email}>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={inputClass}
                                placeholder="correo@ejemplo.com"
                            />
                        </Field>

                        <Field label="Contraseña" error={customErrors.password || errors.password}>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={inputClass}
                                placeholder="Mínimo 8 caracteres"
                            />
                        </Field>

                        <Field label="Teléfono" error={customErrors.phone_number || errors.phone_number}>
                            <input
                                type="text"
                                value={data.phone_number}
                                onChange={(e) => setData('phone_number', e.target.value)}
                                className={inputClass}
                                placeholder="12345678"
                                maxLength={8}
                            />
                        </Field>

                        <Field label="Fecha de nacimiento" error={customErrors.birthdate || errors.birthdate}>
                            <input
                                type="date"
                                value={data.birthdate}
                                onChange={(e) => setData('birthdate', e.target.value)}
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Extensión" optional>
                            <input
                                type="text"
                                value={data.ext ?? ''}
                                onChange={(e) =>
                                    setData('ext', e.target.value.trim() === '' ? null : e.target.value)
                                }
                                className={inputClass}
                                placeholder="—"
                            />
                        </Field>

                        <Field label="Departamento" error={customErrors.department_id || errors.department_id}>
                            <select
                                value={data.department_id ?? ''}
                                onChange={(e) =>
                                    setData('department_id', e.target.value ? Number(e.target.value) : null)
                                }
                                className={inputClass}
                            >
                                <option value="">Selecciona un departamento</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Rol" error={customErrors.role || errors.role}>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value as RoleName | '')}
                                className={inputClass}
                            >
                                <option value="">Selecciona un rol</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Footer */}
                    <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                        <p className="text-xs text-slate-400">
                            Los campos marcados son obligatorios
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {processing ? 'Guardando...' : 'Guardar usuario'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}