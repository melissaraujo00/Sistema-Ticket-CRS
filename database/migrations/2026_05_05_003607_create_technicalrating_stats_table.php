<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('technicalrating_stats', function (Blueprint $table) {
            $table->id();
            $table->decimal('rating_average', 3, 2)->default(0); 
            $table->integer('tickets_resolved')->default(0);    
            $table->decimal('average_time', 8, 2)->default(0);  
            $table->integer('active_technicians')->default(0);

            $table->json('technician_rankings')->nullable();    
            $table->json('monthly_trend')->nullable();          
            $table->json('rating_distribution')->nullable();   
            $table->json('department_performance')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('technicalrating_stats');
    }
};
