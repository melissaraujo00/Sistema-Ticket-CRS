<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $department = Department::where('name', 'Administración')->first();

        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Super Administrador',
                'phone_number' => '00000000',
                'ext' => null,
                'birthdate' => '1990-01-01',
                'password' => Hash::make('123'),
                'is_active' => true,
                'department_id' => $department->id,
                'email_verified_at' => now(),
            ]
        );
    }
}
