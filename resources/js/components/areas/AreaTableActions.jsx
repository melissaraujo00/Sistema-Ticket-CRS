import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';

export default function AreaTableActions({ area, onDelete }) {
    return (
        <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:text-blue-600">
                <Link href={route('areas.edit', area.id)}>
                    <Pencil className="h-4 w-4" />
                </Link>
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => onDelete(area)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
