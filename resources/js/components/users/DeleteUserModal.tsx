import { router } from '@inertiajs/react';

interface Role {
    id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    is_active: number;
    department?: Department | null;
    roles?: Role[];
}

interface Props {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function DeleteUserModal({ user, isOpen, onClose }: Props) {
    if (!isOpen || !user) return null;

    const handleDelete = () => {
        router.delete(`/users/${user.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="text-lg font-bold text-gray-900">
                    Confirmar eliminación
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                    ¿Estás seguro de que deseas eliminar a{' '}
                    <span className="font-semibold text-gray-900">
                        {user.name}
                    </span>
                    ?
                </p>

                <p className="mt-2 text-xs text-red-600">
                    Esta acción es destructiva.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}