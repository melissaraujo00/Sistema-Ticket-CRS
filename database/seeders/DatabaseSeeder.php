<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\AreaSeeder;
use Database\Seeders\CategorySeeder;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\UserSeeder;


class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AreaSeeder::class,
            DepartmentSeeder::class,
            CategorySeeder::class,
            KnowledgeSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            UserRoleSeeder::class,
            DepartmentHeadSeeder::class,
            StatusesTableSeeder::class,
            PrioritiesTableSeeder::class,
            TecnicoDataSeeder::class,
        ]);

    }
}
