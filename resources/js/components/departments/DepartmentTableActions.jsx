import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';

export default function DepartmentTableActions({ department, onDelete }) {
    return (
        <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:text-blue-600">
                <Link href={route('departments.edit', department.id)}>
                    <Pencil className="h-4 w-4" />
                </Link>
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => onDelete(department)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
