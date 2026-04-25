import { usePage } from '@inertiajs/react';

export const ROLE_TRANSLATIONS = {
    superadmin: 'Super Administrador',
    admin: 'Administrador de Área',
    agent: 'Técnico',
    user: 'Solicitante',
};

export const translateRoleName = (roleOption) => {
    if (!roleOption) return '';
    const roleName = typeof roleOption === 'object' ? roleOption.name : roleOption;
    return ROLE_TRANSLATIONS[roleName.toLowerCase()] || roleName;
};

export function usePermissions() {
    const { auth } = usePage().props;

    const hasPermission = (permission) => {
        return auth?.user?.permissions?.includes(permission) ?? false;
    };

    const hasRole = (role) => {
        return auth?.user?.roles?.includes(role) ?? false;
    };

    const getDisplayRole = () => {
        const roleKey = auth?.user?.roles?.[0];
        return ROLE_TRANSLATIONS[roleKey] || 'Sin rol';
    };

    return {
        hasPermission,
        hasRole,
        getDisplayRole,
        authUser: auth?.user,
        userRoles: auth?.user?.roles ?? [],
        userPermissions: auth?.user?.permissions ?? [],
    };
}
