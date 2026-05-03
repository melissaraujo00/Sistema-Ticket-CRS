<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SolutionTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $soporte = \App\Models\Department::where('name', 'Soporte Técnico')->first();
        $sistemas = \App\Models\Department::where('name', 'Desarrollo de Sistemas')->first();

        $hw = \App\Models\HelpTopic::where('name_topic', 'Hardware')->first();
        $sw = \App\Models\HelpTopic::where('name_topic', 'Software')->first();
        $red = \App\Models\HelpTopic::where('name_topic', 'Red')->first();

        $diagnostics = [];

        if ($soporte) {
            if ($hw) {
                $diagnostics[] = ['name' => 'Falla de Disco Duro', 'description' => 'Reemplazo o reparación', 'department_id' => $soporte->id, 'help_topic_id' => $hw->id];
                $diagnostics[] = ['name' => 'Memoria RAM Defectuosa', 'description' => 'Fallo de memoria', 'department_id' => $soporte->id, 'help_topic_id' => $hw->id];
                $diagnostics[] = ['name' => 'Fuente de Poder', 'description' => 'No enciende', 'department_id' => $soporte->id, 'help_topic_id' => $hw->id];
            }
            if ($sw) {
                $diagnostics[] = ['name' => 'Sistema Operativo Corrupto', 'description' => 'Reinstalación requerida', 'department_id' => $soporte->id, 'help_topic_id' => $sw->id];
                $diagnostics[] = ['name' => 'Infección de Malware', 'description' => 'Limpieza de virus', 'department_id' => $soporte->id, 'help_topic_id' => $sw->id];
            }
            if ($red) {
                $diagnostics[] = ['name' => 'Cableado Defectuoso', 'description' => 'Cambio de cable de red', 'department_id' => $soporte->id, 'help_topic_id' => $red->id];
                $diagnostics[] = ['name' => 'Configuración IP', 'description' => 'Problema de asignación IP', 'department_id' => $soporte->id, 'help_topic_id' => $red->id];
            }
        }

        if ($sistemas) {
            if ($hw) {
                $diagnostics[] = ['name' => 'Servidor Caído', 'description' => 'Hardware de servidor dañado', 'department_id' => $sistemas->id, 'help_topic_id' => $hw->id];
            }
            if ($sw) {
                $diagnostics[] = ['name' => 'Bug en Aplicación', 'description' => 'Error de código', 'department_id' => $sistemas->id, 'help_topic_id' => $sw->id];
                $diagnostics[] = ['name' => 'Caída de Base de Datos', 'description' => 'Error en motor DB', 'department_id' => $sistemas->id, 'help_topic_id' => $sw->id];
                $diagnostics[] = ['name' => 'Actualización de Sistema', 'description' => 'Requiere parche', 'department_id' => $sistemas->id, 'help_topic_id' => $sw->id];
            }
            if ($red) {
                $diagnostics[] = ['name' => 'Latencia en API', 'description' => 'Problemas de red hacia el servidor', 'department_id' => $sistemas->id, 'help_topic_id' => $red->id];
                $diagnostics[] = ['name' => 'Bloqueo de Firewall', 'description' => 'Regla de red bloqueando tráfico', 'department_id' => $sistemas->id, 'help_topic_id' => $red->id];
            }
        }

        foreach ($diagnostics as $diag) {
            \App\Models\SolutionType::firstOrCreate([
                'name' => $diag['name'],
                'department_id' => $diag['department_id'],
                'help_topic_id' => $diag['help_topic_id']
            ], [
                'description' => $diag['description'],
                'is_active' => true
            ]);
        }
    }
}
