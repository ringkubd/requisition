<?php

namespace App\Console\Commands;

use App\Services\CashPurposeClassifierService;
use Illuminate\Console\Command;

class ClassifyCashPurposes extends Command
{
    /**
     * @var string
     */
    protected $signature = 'cash:classify-purposes {--force : Re-classify already classified purposes}';

    /**
     * @var string
     */
    protected $description = 'Classify cash requisition item purposes into approved expense categories using the local LLM';

    public function handle(CashPurposeClassifierService $classifier): int
    {
        $total = count($classifier->distinctPairs());
        $pending = $classifier->pendingCount();

        if (empty($classifier->approvedCategories())) {
            $this->error('No approved categories found. Approve a taxonomy from the report first.');

            return self::FAILURE;
        }

        $this->info("Total distinct item/purpose pairs: {$total}; pending: {$pending}");

        $result = $classifier->classifyPending((bool) $this->option('force'));

        $this->table(
            ['total', 'classified', 'failed', 'pending'],
            [[$result['total'], $result['classified'], $result['failed'], $result['pending']]]
        );

        return self::SUCCESS;
    }
}
