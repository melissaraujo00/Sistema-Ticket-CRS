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
            'En Proceso',
            'Resuelto',
            'Cerrado',
            'No Resuelto',
        ];

        foreach ($statuses as $name) {
            Status::firstOrCreate(['name' => $name]);
        }
    }
}
