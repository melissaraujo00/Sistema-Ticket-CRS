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
        Schema::table('technicalrating_stats', function (Blueprint $table) {
            $table->unsignedTinyInteger('month')->after('id')->nullable();
            $table->unsignedSmallInteger('year')->after('month')->nullable();
            
            $table->unique(['month', 'year'], 'period_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('technicalrating_stats', function (Blueprint $table) {
            $table->dropUnique('period_unique');
            $table->dropColumn(['month', 'year']);
        });
    }
};
