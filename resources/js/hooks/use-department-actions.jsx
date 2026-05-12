import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function useDepartmentActions(department = null) {
    const [isProcessingAction, setIsProcessingAction] = useState(null);

    const form = useForm({
        name: department?.name ?? '',
        description: department?.description ?? '',
        email_department: department?.email_department ?? '',
        area_id: department?.area_id ?? '',
        head_ids: department?.heads ? department.heads.map((h) => h.id) : [],
    });

    const toggleHead = (userId) => {
        const currentIds = [...form.data.head_ids];
        if (currentIds.includes(userId)) {
            form.setData(
                'head_ids',
                currentIds.filter((id) => id !== userId),
            );
        } else {
            form.setData('head_ids', [...currentIds, userId]);
        }
    };

    // 1. LÓGICA PARA GUARDAR (POST)
    const store = (e) => {
        if (e) e.preventDefault();

        form.post(route('departments.store'), {
            onError: () => {
                toast.error('Hubo un problema', {
                    description: 'Por favor revisa los campos marcados en rojo.',
                });
            },
        });
    };

    // 2. LÓGICA PARA ACTUALIZAR (PUT/PATCH)
    const update = (e, departmentId) => {
        if (e) e.preventDefault();

        form.patch(route('departments.update', departmentId), {
            onError: () => {
                toast.error('Hubo un problema', {
                    description: 'Por favor revisa los campos marcados en rojo.',
                });
            },
        });
    };

    // 3. LÓGICA PARA ELIMINAR (DELETE)
    const destroy = (departmentId) => {
        form.delete(route('departments.destroy', departmentId));
    };

    // 4. LÓGICA PARA RESTAURAR (PUT)
    const restore = (departmentId, onSuccessCallback) => {
        setIsProcessingAction(departmentId);
        router.put(
            route('departments.restore', departmentId),
            {},
            {
                onSuccess: () => {
                    if (onSuccessCallback) onSuccessCallback();
                    setIsProcessingAction(null);
                },
                onError: () => {
                    setIsProcessingAction(null);
                },
            },
        );
    };

    return {
        form,
        store,
        update,
        destroy,
        restore,
        toggleHead,
        isProcessingAction,
    };
}
