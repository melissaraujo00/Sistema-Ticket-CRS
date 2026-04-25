<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Log;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $nav = [];

        if ($user) {
            // ==========================================
            // 1. DASHBOARD SEGÚN ROL
            // ==========================================
            if ($user->hasRole('superadmin')) {
                $nav[] = ['title' => 'Dashboard', 'url' => route('dashboard'), 'icon' => 'LayoutGrid'];
            } elseif ($user->hasRole('admin')) {
                $nav[] = ['title' => 'Panel de Área', 'url' => route('dashboard'), 'icon' => 'LayoutGrid'];
            } elseif ($user->hasRole('agent')) {
                $nav[] = ['title' => 'Mi Panel Técnico', 'url' => route('dashboard'), 'icon' => 'LayoutGrid'];
            } elseif ($user->hasRole('user')) {
                $nav[] = ['title' => 'Mis Solicitudes', 'url' => route('dashboard'), 'icon' => 'LayoutGrid'];
            }

            // ==========================================
            // 2. SECCIÓN DE TICKETS (según permisos)
            // ==========================================

            // 2.1 Ver mis propios tickets (todos los autenticados)
            // Asumimos un permiso 'view_own_tickets' o simplemente lo mostramos a todos.
            // Para mayor control, puedes usar $user->can('view_own_tickets')
            if ($user->can('view_own_tickets')) {
                $nav[] = ['title' => 'Mis Tickets', 'url' => route('tickets.my'), 'icon' => 'Ticket'];
            }

            // 2.2 Crear un nuevo ticket (permiso básico)
            if ($user->can('create_tickets')) {
                $nav[] = ['title' => 'Nuevo Ticket', 'url' => route('tickets.create'), 'icon' => 'PlusCircle'];
            }

            // 2.3 Ver todos los tickets (solo roles con permiso 'view_all_tickets')
            if ($user->can('view_all_tickets')) {
                $nav[] = ['title' => 'Todos los Tickets', 'url' => route('tickets.index'), 'icon' => 'List'];
            }

            // 2.4 Tickets pendientes de asignación (permiso existente)
            if ($user->can('assign_tickets')) {
                $nav[] = ['title' => 'Pendientes', 'url' => route('tickets.unassigned'), 'icon' => 'ClipboardList'];
            }

            // ==========================================
            // 3. FAQs (Acceso universal)
            // ==========================================
            $nav[] = ['title' => 'FAQs', 'url' => route('faqs.index'), 'icon' => 'BookOpen'];

            // ==========================================
            // 4. CONFIGURACIÓN (Submenú agrupado)
            // ==========================================
            if ($user->hasPermissionTo('manage_catalogs')) {
                $nav[] = [
                    'title' => 'Configuración',
                    'icon' => 'Settings',
                    'items' => [
                        ['title' => 'Planes SLA', 'url' => route('sla-plans.index'), 'icon' => 'FileText'],
                        ['title' => 'Prioridades', 'url' => route('priorities.index'), 'icon' => 'AlertTriangle'],
                    ]
                ];
            }

            // ==========================================
            // 5. USUARIOS (permiso específico)
            // ==========================================
            if ($user->hasPermissionTo('manage_users')) {
                $nav[] = ['title' => 'Usuarios', 'url' => route('users.index'), 'icon' => 'Users'];
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'roles' => $user->getRoleNames()->toArray(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray()
                ]) : null,
            ],
            'navigation' => $nav,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => fn () => $request->user()
                ? $request->user()->unreadNotifications
                : [],
        ];
    }
}
