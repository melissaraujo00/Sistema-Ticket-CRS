<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Accesos y credenciales', 'description' => 'Gestión de usuarios, contraseñas y autenticación'],
            ['name' => 'Hardware', 'description' => 'Problemas y solicitudes relacionadas con equipos físicos'],
            ['name' => 'Software', 'description' => 'Instalación, errores y uso de aplicaciones'],
            ['name' => 'Redes y conectividad', 'description' => 'Conexión a internet, VPN y redes internas'],
            ['name' => 'Correo y comunicación', 'description' => 'Problemas con email, mensajería y comunicación interna'],
            ['name' => 'Sistemas internos', 'description' => 'Uso y fallas en sistemas propios de la empresa'],
            ['name' => 'Procesos administrativos', 'description' => 'Procedimientos internos de RRHH, contabilidad y gestión'],
            ['name' => 'Incidentes operativos', 'description' => 'Problemas que afectan la operación diaria'],
            ['name' => 'Solicitudes de servicio', 'description' => 'Requerimientos de nuevos servicios o accesos'],
            ['name' => 'Mantenimiento', 'description' => 'Reparaciones y mantenimiento de infraestructura o equipos'],
            ['name' => 'Seguridad', 'description' => 'Políticas, accesos indebidos y protección de información'],
            ['name' => 'Capacitación y uso', 'description' => 'Guías y aprendizaje sobre herramientas y procesos'],
            ['name' => 'Equipos y herramientas', 'description' => 'Asignación y uso de herramientas de trabajo'],
            ['name' => 'Inventario', 'description' => 'Gestión y control de activos y existencias'],
            ['name' => 'Otros', 'description' => 'Casos no contemplados en otras categorías'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
