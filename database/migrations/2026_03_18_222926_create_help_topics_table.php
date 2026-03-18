<?php

use App\Models\Division;
use App\Models\knowledge;
use App\Models\Priority;
use App\Models\SlaPlan;
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
        Schema::create('help_topics', function (Blueprint $table) {
            $table->id();
            $table->string('name_topic', 60);
            $table->foreignIdFor(Division::class)->constrained();
            $table->foreignIdFor(SlaPlan::class)->constrained();
            $table->foreignIdFor(knowledge::class)->constrained();
            $table->foreignIdFor(Priority::class)->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('help_topics');
    }
};
