import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function useAreaActions(area = null) {
    const [isProcessingAction, setIsProcessingAction] = useState(null);

    const form = useForm({
        name: area?.name ?? '',
        description: area?.description ?? '',
    });

    // 1. LÓGICA PARA GUARDAR (POST)
    const store = (e) => {
        if (e) e.preventDefault();

        form.post(route('areas.store'), {
            // Eliminamos onSuccess. Si el backend guarda bien, redireccionará al Index automáticamente.
            onError: () => {
                toast.error('Hubo un problema', {
                    description: 'Por favor revisa los campos marcados en rojo.',
                });
            },
        });
    };

    // 2. LÓGICA PARA ACTUALIZAR (PUT/PATCH)
    const update = (e, areaId) => {
        if (e) e.preventDefault();

        form.patch(route('areas.update', areaId), {
            onError: () => {
                toast.error('Hubo un problema', {
                    description: 'Por favor revisa los campos marcados en rojo.',
                });
            },
        });
    };

    // 3. LÓGICA PARA ELIMINAR (DELETE)
    const destroy = (areaId) => {
        form.delete(route('areas.destroy', areaId));
    };

    // 4. LÓGICA PARA RESTAURAR (PUT)
    const restore = (areaId, onSuccessCallback) => {
        setIsProcessingAction(areaId);
        router.put(
            route('areas.restore', areaId),
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
        isProcessingAction,
    };
}
