<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Obtener las últimas notificaciones para el dropdown.
     */
    public function fetch(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'notifications' => $user->notifications()->take(10)->get(),
            'unread_count' => $user->unreadNotifications->count(),
        ]);
    }

    /**
     * Marcar una notificación como leída y redirigir a la URL asociada.
     */
    public function markAsRead($id, Request $request)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $url = $notification->data['url'] ?? route('dashboard');
        $notification->markAsRead();
        return redirect()->to($url);
    }

    /**
     * Marcar todas las notificaciones como leídas.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return redirect()->back();
    }
}
