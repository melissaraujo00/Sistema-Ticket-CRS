<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSummarySeeder extends Seeder
{
    public function run(): void
    {
        $this->command->line("");
        $this->command->info('      CRS - ACCESOS DE USUARIOS REGISTRADOS EN EL SISTEMA       ');

        $passwords = [
            'admin@cruzroja.com'           => '123',
            'admin.soporte@cruzroja.com'   => '123456',
            'admin.sistemas@cruzroja.com'  => '123456',
            'carlos.soporte@cruzroja.com'  => '123456',
            'maria.sistemas@cruzroja.com'  => '123456',
            'juan.soporte@cruzroja.com'    => '123456',
            'ana.sistemas@cruzroja.com'    => '123456',
        ];

        $users = User::whereIn('email', array_keys($passwords))->get();

        $rows = $users->map(fn($user) => [
            $user->institution_code,
            $user->name,
            $user->email,
            $passwords[$user->email] ?? 'Desconocida'
        ])->toArray();


        $headers = ['Código Inst.', 'Nombre Completo', 'Correo Electrónico', 'Contraseña Web'];
        $this->command->table($headers, $rows);

        $this->command->line("");
    }
}
