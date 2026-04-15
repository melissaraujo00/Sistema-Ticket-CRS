<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Area;
use App\Models\Department;
use App\Models\User;
use App\Models\Status;
use App\Models\Priority;
use App\Models\HelpTopic;
use App\Models\SlaPlan;
use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\Division;
use App\Models\Knowledge;
use App\Models\Category;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class TecnicoDataSeeder extends Seeder
{
    public function run(): void
    {
        //Estos datos son meramente de testingg
        Role::firstOrCreate(['name' => 'tecnico']);

        // Crear areas
        $areaSoporte = Area::firstOrCreate([
            'name' => 'Soporte Técnico',
            'description' => 'Área encargada del soporte técnico y mantenimiento de sistemas'
        ]);

        $areaSistemas = Area::firstOrCreate([
            'name' => 'Sistemas',
            'description' => 'Área de desarrollo y administración de sistemas'
        ]);

        // Crear departamentos
        $deptSoporte = Department::firstOrCreate([
            'name' => 'Soporte Técnico',
            'description' => 'Departamento de soporte técnico a usuarios',
            'email_department' => 'soporte@empresa.com',
            'area_id' => $areaSoporte->id
        ]);

        $deptSistemas = Department::firstOrCreate([
            'name' => 'Desarrollo de Sistemas',
            'description' => 'Departamento de desarrollo de software',
            'email_department' => 'sistemas@empresa.com',
            'area_id' => $areaSistemas->id
        ]);

        // Crear usuarios técnicos
        $tecnico1 = User::firstOrCreate([
            'email' => 'tecnico1@empresa.com'
        ], [
            'name' => 'Carlos Rodríguez',
            'phone_number' => '55555555',
            'ext' => '101',
            'birthdate' => '1985-05-15',
            'password' => Hash::make('123456'),
            'is_active' => true,
            'department_id' => $deptSoporte->id,
            'email_verified_at' => now(),
        ]);
        $tecnico1->assignRole('tecnico');

        $tecnico2 = User::firstOrCreate([
            'email' => 'tecnico2@empresa.com'
        ], [
            'name' => 'María González',
            'phone_number' => '66666666',
            'ext' => '102',
            'birthdate' => '1990-08-20',
            'password' => Hash::make('123456'),
            'is_active' => true,
            'department_id' => $deptSistemas->id,
            'email_verified_at' => now(),
        ]);
        $tecnico2->assignRole('tecnico');

        // Crear usuarios solicitantes
        $usuario1 = User::firstOrCreate([
            'email' => 'juan.perez@empresa.com'
        ], [
            'name' => 'Juan Pérez',
            'phone_number' => '77777777',
            'ext' => '201',
            'birthdate' => '1988-03-10',
            'password' => Hash::make('123456'),
            'is_active' => true,
            'department_id' => $deptSoporte->id,
            'email_verified_at' => now(),
        ]);
        $usuario1->assignRole('user');

        $usuario2 = User::firstOrCreate([
            'email' => 'ana.martinez@empresa.com'
        ], [
            'name' => 'Ana Martínez',
            'phone_number' => '88888888',
            'ext' => '202',
            'birthdate' => '1992-11-25',
            'password' => Hash::make('123456'),
            'is_active' => true,
            'department_id' => $deptSistemas->id,
            'email_verified_at' => now(),
        ]);
        $usuario2->assignRole('user');

        // Crear estados de tickets
        $estadoAbierto = Status::firstOrCreate(['name' => 'Abierto']);
        $estadoEnProceso = Status::firstOrCreate(['name' => 'En Proceso']);
        $estadoResuelto = Status::firstOrCreate(['name' => 'Resuelto']);
        $estadoCerrado = Status::firstOrCreate(['name' => 'Cerrado']);

        // Crear prioridades
        $prioridadBaja = Priority::firstOrCreate([
            'name' => 'Baja',
            'color' => '#28a745',
            'level' => 1
        ]);

        $prioridadMedia = Priority::firstOrCreate([
            'name' => 'Media',
            'color' => '#ffc107',
            'level' => 2
        ]);

        $prioridadAlta = Priority::firstOrCreate([
            'name' => 'Alta',
            'color' => '#fd7e14',
            'level' => 3
        ]);

        $prioridadCritica = Priority::firstOrCreate([
            'name' => 'Crítica',
            'color' => '#dc3545',
            'level' => 4
        ]);

        // Crear planes SLA
        $slaBasico = SlaPlan::firstOrCreate([
            'name' => 'Básico',
            'grace_time_hours' => 48,
            'working_hours' => 9
        ]);

        $slaPremium = SlaPlan::firstOrCreate([
            'name' => 'Premium',
            'grace_time_hours' => 24,
            'working_hours' => 7
        ]);

        // Crear categorías para knowledge base
        $categoriaHardware = Category::firstOrCreate([
            'name' => 'Hardware',
            'description' => 'Artículos y guías sobre problemas de hardware'
        ]);

        $categoriaSoftware = Category::firstOrCreate([
            'name' => 'Software',
            'description' => 'Artículos y guías sobre problemas de software'
        ]);

        $categoriaRed = Category::firstOrCreate([
            'name' => 'Red',
            'description' => 'Artículos y guías sobre problemas de red'
        ]);

        // Crear knowledge base
        $knowledgeHardware = Knowledge::firstOrCreate([
            'title' => 'Guía básica de solución de problemas de hardware',
            'content_response' => 'Pasos básicos para diagnosticar y solucionar problemas comunes de hardware como impresoras, monitores, etc.',
            'creation_date' => Carbon::now()->subMonths(6),
            'category_id' => $categoriaHardware->id
        ]);

        $knowledgeSoftware = Knowledge::firstOrCreate([
            'title' => 'Guía de solución de problemas de software',
            'content_response' => 'Pasos para diagnosticar y solucionar problemas de acceso a sistemas y aplicaciones.',
            'creation_date' => Carbon::now()->subMonths(6),
            'category_id' => $categoriaSoftware->id
        ]);

        $knowledgeRed = Knowledge::firstOrCreate([
            'title' => 'Guía de solución de problemas de red',
            'content_response' => 'Pasos para diagnosticar y solucionar problemas de conectividad y velocidad de red.',
            'creation_date' => Carbon::now()->subMonths(6),
            'category_id' => $categoriaRed->id
        ]);

        // Crear divisiones
        $divisionHardware = Division::firstOrCreate([
            'name' => 'Soporte Hardware',
            'characteristics' => 'Encargado de problemas físicos de equipos',
            'department_id' => $deptSoporte->id
        ]);

        $divisionSoftware = Division::firstOrCreate([
            'name' => 'Soporte Software',
            'characteristics' => 'Encargado de problemas de aplicaciones y sistemas',
            'department_id' => $deptSistemas->id
        ]);

        $divisionRed = Division::firstOrCreate([
            'name' => 'Soporte Red',
            'characteristics' => 'Encargado de problemas de conectividad',
            'department_id' => $deptSoporte->id
        ]);

        // Crear temas de ayuda
        $temaHardware = HelpTopic::firstOrCreate([
            'name_topic' => 'Problemas de Hardware',
            'division_id' => $divisionHardware->id,
            'priority_id' => $prioridadMedia->id,
            'sla_plan_id' => $slaBasico->id,
            'knowledge_id' => $knowledgeHardware->id
        ]);

        $temaSoftware = HelpTopic::firstOrCreate([
            'name_topic' => 'Problemas de Software',
            'division_id' => $divisionSoftware->id,
            'priority_id' => $prioridadAlta->id,
            'sla_plan_id' => $slaPremium->id,
            'knowledge_id' => $knowledgeSoftware->id
        ]);

        $temaRed = HelpTopic::firstOrCreate([
            'name_topic' => 'Problemas de Red',
            'division_id' => $divisionRed->id,
            'priority_id' => $prioridadCritica->id,
            'sla_plan_id' => $slaPremium->id,
            'knowledge_id' => $knowledgeRed->id
        ]);

        // Crear tickets de ejemplo para el técnico 1 (Carlos Rodríguez)
        $tickets = [
            [
                'code' => 'TK-001',
                'subject' => 'Impresora no funciona',
                'message' => 'La impresora HP del departamento no responde y no imprime documentos. He intentado reiniciarla pero sigue sin funcionar.',
                'email' => 'juan.perez@empresa.com',
                'attach' => 'impresora_error.jpg',
                'requesting_user' => $usuario1->id,
                'assigned_user' => $tecnico1->id,
                'help_topic_id' => $temaHardware->id,
                'priority_id' => $prioridadMedia->id,
                'sla_plan_id' => $slaBasico->id,
                'department_id' => $deptSoporte->id,
                'status_id' => $estadoEnProceso->id,
                'creation_date' => Carbon::now()->subDays(2),
                'expiration_date' => Carbon::now()->addDays(1),
                'closing_date' => Carbon::now()->addMonth(),
            ],
            [
                'code' => 'TK-002',
                'subject' => 'No puedo acceder al sistema',
                'message' => 'Al intentar ingresar al sistema de gestión, me aparece un error de credenciales incorrectas.',
                'email' => 'ana.martinez@empresa.com',
                'attach' => 'error_acceso.png',
                'requesting_user' => $usuario2->id,
                'assigned_user' => $tecnico1->id,
                'help_topic_id' => $temaSoftware->id,
                'priority_id' => $prioridadAlta->id,
                'sla_plan_id' => $slaPremium->id,
                'department_id' => $deptSistemas->id,
                'status_id' => $estadoResuelto->id,
                'creation_date' => Carbon::now()->subDays(5),
                'expiration_date' => Carbon::now()->subDays(3),
                'closing_date' => Carbon::now()->subDays(2),
            ],
            [
                'code' => 'TK-003',
                'subject' => 'Internet muy lento',
                'message' => 'La conexión a internet en toda el área de sistemas está extremadamente lenta, afectando nuestra productividad.',
                'email' => 'juan.perez@empresa.com',
                'attach' => 'speed_test.png',
                'requesting_user' => $usuario1->id,
                'assigned_user' => $tecnico1->id,
                'help_topic_id' => $temaRed->id,
                'priority_id' => $prioridadCritica->id,
                'sla_plan_id' => $slaPremium->id,
                'department_id' => $deptSoporte->id,
                'status_id' => $estadoAbierto->id,
                'creation_date' => Carbon::now()->subHours(6),
                'expiration_date' => Carbon::now()->addHours(18),
                'closing_date' => Carbon::now()->addMonth(),
            ],
            [
                'code' => 'TK-004',
                'subject' => 'Monitor parpadea',
                'message' => 'El monitor de mi escritorio comienza a parpadear intermitentemente, causando dolor de cabeza.',
                'email' => 'ana.martinez@empresa.com',
                'attach' => 'monitor_flicker.mp4',
                'requesting_user' => $usuario2->id,
                'assigned_user' => $tecnico1->id,
                'help_topic_id' => $temaHardware->id,
                'priority_id' => $prioridadBaja->id,
                'sla_plan_id' => $slaBasico->id,
                'department_id' => $deptSoporte->id,
                'status_id' => $estadoCerrado->id,
                'creation_date' => Carbon::now()->subWeek(),
                'expiration_date' => Carbon::now()->subDays(4),
                'closing_date' => Carbon::now()->subDays(3),
            ],
            [
                'code' => 'TK-005',
                'subject' => 'Error en base de datos',
                'message' => 'El sistema muestra errores de conexión a la base de datos cuando intento generar reportes.',
                'email' => 'juan.perez@empresa.com',
                'attach' => 'db_error.log',
                'requesting_user' => $usuario1->id,
                'assigned_user' => $tecnico1->id,
                'help_topic_id' => $temaSoftware->id,
                'priority_id' => $prioridadAlta->id,
                'sla_plan_id' => $slaPremium->id,
                'department_id' => $deptSistemas->id,
                'status_id' => $estadoEnProceso->id,
                'creation_date' => Carbon::now()->subDay(),
                'expiration_date' => Carbon::now()->addDay(),
                'closing_date' => Carbon::now()->addMonth(),
            ]
        ];

        foreach ($tickets as $ticketData) {
            Ticket::firstOrCreate(['code' => $ticketData['code']], $ticketData);
        }

        $this->command->info('Datos de ejemplo para técnico creados exitosamente!');
        $this->command->info('Usuario técnico: tecnico1@empresa.com / contraseña: 123456');
        $this->command->info('Usuario técnico 2: tecnico2@empresa.com / contraseña: 123456');
        $this->command->info('Usuarios solicitantes: juan.perez@empresa.com, ana.martinez@empresa.com / contraseña: 123456');
    }
}
