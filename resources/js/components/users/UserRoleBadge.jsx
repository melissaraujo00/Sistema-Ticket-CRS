import { ROLE_TRANSLATIONS } from '@/hooks/usePermissions';

const getRoleColor = (roleName) => {
    switch (roleName?.toLowerCase()) {
        case 'superadmin':
            return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        case 'admin':
            return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
        case 'agent':
            return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        default:
            return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
};

export default function UserRoleBadge({ role }) {
    const displayName = ROLE_TRANSLATIONS[role?.name] || role?.name;

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getRoleColor(role?.name)}`}>
            {displayName}
        </span>
    );
}
