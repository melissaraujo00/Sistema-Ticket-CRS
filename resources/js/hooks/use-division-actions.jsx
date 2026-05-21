import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function useDivisionActions(division = null) {
    const [isProcessingAction, setIsProcessingAction] = useState(null);

    const form = useForm({
        name: division?.name ?? '',
        characteristics: division?.characteristics ?? '',
        department_id: division?.department_id ?? '',
    });

    // 1. LÓGICA PARA GUARDAR (POST)
    const store = (e) => {
        if (e) e.preventDefault();

        form.post(route('divisions.store'), {
            onError: () => {
                toast.error('Hubo un problema', {
                    description: 'Por favor revisa los campos marcados en rojo.',
                });
            },
        });
    };

    // 2. LÓGICA PARA ACTUALIZAR (PATCH)
    const update = (e, divisionId) => {
        if (e) e.preventDefault();

        form.patch(route('divisions.update', divisionId), {
            onError: () => {
                toast.error('Hubo un problema', {
                    description: 'Por favor revisa los campos marcados en rojo.',
                });
            },
        });
    };

    // 3. LÓGICA PARA ELIMINAR (DELETE)
    const destroy = (divisionId) => {
        form.delete(route('divisions.destroy', divisionId), {
            onError: (errors) => {
                // Captura el error específico del service (ej. temas de ayuda asociados)
                toast.error('Error al eliminar', {
                    description: errors.message || 'No se pudo completar la acción.',
                });
            },
        });
    };

    // 4. LÓGICA PARA RESTAURAR (PUT)
    const restore = (divisionId, onSuccessCallback) => {
        setIsProcessingAction(divisionId);
        router.put(
            route('divisions.restore', divisionId),
            {},
            {
                onSuccess: () => {
                    if (onSuccessCallback) onSuccessCallback();
                    setIsProcessingAction(null);
                    toast.success('División restaurada exitosamente.');
                },
                onError: () => {
                    setIsProcessingAction(null);
                    toast.error('Error al restaurar la división.');
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
