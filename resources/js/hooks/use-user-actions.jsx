import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function useUserActions(user = null) {
    const [isDeleting, setIsDeleting] = useState(false);

    // Validamos si el usuario en edición es jefe de su departamento actual
    const isHead = user?.headed_departments?.some(dept => dept.id === user.department_id) ?? false;

    const form = useForm({
        name: user?.name ?? '',
        institution_code: user?.institution_code ?? '',
        email: user?.email ?? '',
        password: '',
        phone_number: user?.phone_number ?? '',
        ext: user?.ext ?? '',
        birthdate: user?.birthdate ?? '',
        area_id: user?.department?.area_id ?? '',
        department_id: user?.department_id ?? '',
        role: user?.roles?.[0]?.name ?? '',
        is_head: isHead,
    });

    const store = (e, onSuccess) => {
        e.preventDefault();

        form.post(route('users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                if (onSuccess) onSuccess();
            },
            onError: () => {
                toast.error('Error al crear usuario', {
                    description: 'Por favor, revisa los campos marcados en rojo.',
                });
            },
        });
    };

    const update = (e, userId, onSuccess) => {
        e.preventDefault();

        form.patch(route('users.update', userId), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('password');
                if (onSuccess) onSuccess();
            },
            onError: () => {
                toast.error('Error al actualizar', {
                    description: 'Por favor, revisa los campos marcados en rojo.',
                });
            },
        });
    };

    const destroy = (userId, onSuccess) => {
        setIsDeleting(true);

        router.delete(route('users.destroy', userId), {
            preserveScroll: true,
            onSuccess: () => {
                if (onSuccess) onSuccess();
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const restore = (userId, onSuccess) => {
        router.put(
            route('users.restore', userId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (onSuccess) onSuccess();
                },
                onError: () => toast.error('Error al intentar restaurar el usuario'),
            },
        );
    };

    return { form, store, update, destroy, restore, isDeleting };
}
