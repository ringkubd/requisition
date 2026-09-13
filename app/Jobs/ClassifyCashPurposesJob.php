<?php

namespace App\Jobs;

use App\Services\CashPurposeClassifierService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ClassifyCashPurposesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 3600;
    public int $tries = 1;

    public bool $force;

    public function __construct(bool $force = false)
    {
        $this->force = $force;
    }

    public function handle(CashPurposeClassifierService $classifier): void
    {
        $result = $classifier->classifyPending($this->force);

        Log::info('Cash purpose classification finished', $result);
    }
}
