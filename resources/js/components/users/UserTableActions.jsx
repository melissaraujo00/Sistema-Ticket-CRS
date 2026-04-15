/* global route */
import { Button } from '@/components/ui/button.jsx';
import { Link } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';

export default function UserTableActions({ user, authUser, onDelete }) {
    const canDelete = user.id !== 1 && user.id !== authUser?.id;

    return (
        <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:text-blue-600">
                <Link href={route('users.edit', user.id)}>
                    <Pencil className="h-4 w-4" />
                </Link>
            </Button>

            {canDelete && (
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => onDelete(user)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
