<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\AreaSeeder;
use Database\Seeders\CategorySeeder;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\HelpTopicSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\PrioritiesSeeder;


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
            PrioritiesSeeder::class,
            TecnicoDataSeeder::class,
            HelpTopicSeeder::class,
            SolutionTypeSeeder::class,
            DatabaseSummarySeeder::class,
        ]);

    }
}
