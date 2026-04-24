<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Status;

class StatusesTableSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            'Pendiente a asignación',
            'Asignado',
            'Abierto',
            'En Proceso',      // ← Nombre consistente con TecnicoDataSeeder
            'Resuelto',
            'Cerrado',
            // 'En espera',     // Opcional: si lo necesitas, agrégalo
        ];

        foreach ($statuses as $name) {
            Status::firstOrCreate(['name' => $name]);
        }
    }
}
