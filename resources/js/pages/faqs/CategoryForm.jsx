import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';

export default function CategoryForm({ category = null, onSuccess }) {
    const isEditing = !!category;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: category?.name || '',
    });

    // Sincronizar el formulario si la categoría cambia (cuando se abre para editar)
    useEffect(() => {
        if (category) {
            setData('name', category.name);
        } else {
            reset();
        }
    }, [category]);

    const submit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            put(route('category.update', category.id), {
                onSuccess: () => {
                    onSuccess();
                },
            });
        } else {
            post(route('category.store'), {
                onSuccess: () => {
                    reset();
                    onSuccess();
                },
            });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la categoría</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ej. Hardware, Software..."
                    className={errors.name ? 'border-red-500' : ''}
                    autoFocus
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => onSuccess()}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
}
