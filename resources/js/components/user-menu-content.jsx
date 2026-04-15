import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { Link } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { route } from 'ziggy-js';

export function UserMenuContent({ user }) {
    const cleanup = useMobileNavigation();

    return (
        <>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={cleanup}>
                    <LogOut className="mr-2" />
                    Cerrar Sesión
                </Link>
            </DropdownMenuItem>
        </>
    );
}
