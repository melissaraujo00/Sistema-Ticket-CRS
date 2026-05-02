/* global route */
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export function useUserActions(user = null) {
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        phone_number: user?.phone_number ?? '',
        ext: user?.ext ?? '',
        birthdate: user?.birthdate ?? '',
        department_id: user?.department_id ?? '',
        role: user?.roles?.[0]?.name ?? '',
    });

    const store = (e, onSuccess) => {
        e.preventDefault();

        form.post(route('users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                if (onSuccess) onSuccess();
            },
        });
    };

    const update = (e, userId, onSuccess) => {
        e.preventDefault();

        form.patch(route('users.update', userId), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                if (onSuccess) onSuccess();
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

    return { form, store, update, destroy, isDeleting };
}

