<?php

namespace App\Services;

use App\Models\CashExpenseCategory;
use App\Models\CashPurposeCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CashPurposeClassifierService
{
    protected LiteLLMService $llm;
    protected int $batchSize;

    public function __construct(LiteLLMService $llm)
    {
        $this->llm = $llm;
        $this->batchSize = (int) config('services.litellm.batch_size', 20);
    }

    /**
     * Distinct (item, purpose) pairs of cash requisition items.
     *
     * @return array<int,array{item:string,purpose:string}>
     */
    public function distinctPairs(): array
    {
        return DB::table('cash_requisition_items')
            ->whereNull('deleted_at')
            ->where(function ($q) {
                $q->where(function ($q) {
                    $q->whereNotNull('item')->where('item', '!=', '');
                })->orWhere(function ($q) {
                    $q->whereNotNull('purpose')->where('purpose', '!=', '');
                });
            })
            ->select('item', 'purpose')
            ->distinct()
            ->get()
            ->map(fn ($r) => [
                'item' => trim((string) $r->item),
                'purpose' => trim((string) $r->purpose),
            ])
            ->unique(fn ($r) => $r['item'] . '||' . $r['purpose'])
            ->values()
            ->all();
    }

    /**
     * Sample of distinct item names and purposes to propose a taxonomy.
     */
    public function sampleForTaxonomy(int $purposeSample = 80): array
    {
        $items = DB::table('cash_requisition_items')
            ->whereNotNull('item')
            ->where('item', '!=', '')
            ->whereNull('deleted_at')
            ->distinct()
            ->orderBy('item')
            ->limit(250)
            ->pluck('item')
            ->map(fn ($i) => trim((string) $i))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $purposes = DB::table('cash_requisition_items')
            ->whereNotNull('purpose')
            ->where('purpose', '!=', '')
            ->whereNull('deleted_at')
            ->distinct()
            ->inRandomOrder()
            ->limit($purposeSample)
            ->pluck('purpose')
            ->map(fn ($p) => trim((string) $p))
            ->filter()
            ->unique()
            ->values()
            ->all();

        return ['items' => $items, 'purposes' => $purposes];
    }

    /**
     * Ask the LLM to propose an expense category taxonomy from the data.
     */
    public function proposeCategories(int $max = 16): array
    {
        $sample = $this->sampleForTaxonomy();

        $system = 'You are a finance analyst. You design expense category taxonomies for cash requisitions '
            . '(petty cash) of a non-profit organization in Bangladesh. Categories must be short, general and '
            . 'mutually exclusive. Reply with ONLY a JSON array of category name strings, no explanation.';

        $user = "Below are example cash requisition item names and reasons (purpose) from our records.\n\n"
            . "ITEM NAMES:\n" . implode("\n", $sample['items']) . "\n\n"
            . "EXAMPLE PURPOSES:\n" . implode("\n", $sample['purposes']) . "\n\n"
            . "Propose {$max} or fewer expense categories that best cover all of these (fuel/octane, vehicle "
            . "maintenance, mobile/internet, office supplies, repairs, entertainment, training, utilities, "
            . "staff welfare, etc.). Return a JSON array of strings, e.g. [\"Fuel\", \"Vehicle Maintenance\", ...].";

        $result = $this->llm->chatJson($system, $user);

        if (isset($result['categories']) && is_array($result['categories'])) {
            $result = $result['categories'];
        }

        return collect($result)
            ->map(function ($c) {
                if (is_string($c)) {
                    return $c;
                }
                if (is_array($c)) {
                    return $c['category'] ?? $c['name'] ?? $c['title'] ?? null;
                }

                return null;
            })
            ->filter(fn ($c) => is_string($c) && trim($c) !== '')
            ->map(fn ($c) => trim($c))
            ->unique()
            ->take($max)
            ->values()
            ->all();
    }

    /**
     * Persist an approved taxonomy (replaces the current list).
     */
    public function approveCategories(array $categories): array
    {
        $categories = collect($categories)
            ->filter(fn ($c) => is_string($c) && trim($c) !== '')
            ->map(fn ($c) => trim($c))
            ->unique()
            ->values()
            ->all();

        DB::transaction(function () use ($categories) {
            CashExpenseCategory::query()->delete();
            foreach ($categories as $i => $name) {
                CashExpenseCategory::create([
                    'name' => $name,
                    'sort_order' => $i,
                    'is_active' => true,
                    'model' => $this->llm->model(),
                ]);
            }
        });

        return $categories;
    }

    public function approvedCategories(): array
    {
        return CashExpenseCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->pluck('name')
            ->all();
    }

    public function hashPair(string $item, string $purpose): string
    {
        $normalize = fn ($v) => mb_strtolower(trim(preg_replace('/\s+/u', ' ', (string) $v)));

        return sha1($normalize($item) . '||' . $normalize($purpose));
    }

    /**
     * Classify all uncached (item, purpose) pairs into the approved categories.
     *
     * @return array{total:int,classified:int,failed:int,pending:int}
     */
    public function classifyPending(bool $force = false): array
    {
        $categories = $this->approvedCategories();
        if (empty($categories)) {
            return ['total' => 0, 'classified' => 0, 'failed' => 0, 'pending' => 0];
        }

        $pairs = $this->distinctPairs();
        $hashes = [];
        foreach ($pairs as $pair) {
            $hashes[$this->hashPair($pair['item'], $pair['purpose'])] = $pair;
        }

        $existing = CashPurposeCategory::query()
            ->whereIn('purpose_hash', array_keys($hashes))
            ->pluck('purpose_hash')
            ->all();

        $pending = $force
            ? array_values($hashes)
            : array_values(array_diff_key($hashes, array_flip($existing)));

        $classified = 0;
        $failed = 0;
        $batches = array_chunk($pending, $this->batchSize);

        foreach ($batches as $batch) {
            try {
                $map = $this->classifyBatch($batch, $categories);
                $now = now();
                $rows = [];
                foreach (array_values($batch) as $index => $pair) {
                    $category = $map[$index] ?? null;
                    if (!$category || !in_array($category, $categories, true)) {
                        $failed++;
                        continue;
                    }
                    $rows[] = [
                        'purpose_hash' => $this->hashPair($pair['item'], $pair['purpose']),
                        'item' => $pair['item'],
                        'purpose' => $pair['purpose'],
                        'category' => $category,
                        'category_id' => null,
                        'confidence' => null,
                        'model' => $this->llm->model(),
                        'is_manual' => false,
                        'classified_at' => $now,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                    $classified++;
                }

                if (!empty($rows)) {
                    CashPurposeCategory::upsert(
                        $rows,
                        ['purpose_hash'],
                        ['item', 'purpose', 'category', 'category_id', 'confidence', 'model', 'is_manual', 'classified_at', 'updated_at']
                    );
                }
            } catch (\Throwable $e) {
                Log::warning('Cash purpose classification batch failed', [
                    'error' => $e->getMessage(),
                ]);
                $failed += count($batch);
            }
        }

        return [
            'total' => count($pairs),
            'classified' => $classified,
            'failed' => $failed,
            'pending' => max(0, count($pairs) - count($existing) - $classified),
        ];
    }

    /**
     * Classify one batch of pairs. Keys of the returned map are the input indices.
     *
     * @param  array<int,array{item:string,purpose:string}>  $pairs
     * @return array<int,string>
     */
    public function classifyBatch(array $pairs, array $categories): array
    {
        $list = [];
        foreach (array_values($pairs) as $i => $pair) {
            $list[] = ($i + 1) . '. Item: ' . $pair['item'] . ' | Purpose: ' . $pair['purpose'];
        }

        $system = 'You are an expense classifier for cash requisitions (petty cash). Every entry MUST be '
            . 'assigned to exactly one category from this exact list: [' . implode(', ', $categories) . ']. '
            . 'Use BOTH the item name and the purpose to decide. Reply with ONLY a JSON object mapping each '
            . 'entry number (as a string) to one category name from the list. Do not invent categories.';

        $user = implode("\n", $list)
            . "\n\nReturn a JSON object like {\"1\": \"Fuel\", \"2\": \"Mobile & Internet\"}.";

        $raw = $this->llm->chatJson($system, $user);

        $canonical = [];
        foreach ($categories as $c) {
            $canonical[mb_strtolower(trim($c))] = $c;
        }

        $match = function ($value) use ($canonical) {
            if (!is_string($value)) {
                return null;
            }

            return $canonical[mb_strtolower(trim($value))] ?? null;
        };

        $result = [];

        // Shape A: {"1": "Fuel", "2": "Mobile & Internet"}
        $isFlatMap = !empty($raw);
        foreach ($raw as $k => $v) {
            if (!is_numeric($k) || is_array($v)) {
                $isFlatMap = false;
                break;
            }
        }

        if ($isFlatMap) {
            foreach ($raw as $key => $value) {
                $cat = $match($value);
                if ($cat !== null) {
                    $result[((int) $key) - 1] = $cat;
                }
            }

            return $result;
        }

        // Shape B: [{"item": 1, "category": "Fuel"}, ...] or ["Fuel", ...]
        foreach (array_values($raw) as $i => $entry) {
            $idx = $i;
            $cat = null;
            if (is_string($entry)) {
                $cat = $match($entry);
            } elseif (is_array($entry)) {
                $cat = $match($entry['category'] ?? $entry['Category'] ?? $entry['name'] ?? null);
                $num = $entry['item'] ?? $entry['id'] ?? $entry['index'] ?? $entry['no'] ?? null;
                if ($num !== null && is_numeric($num)) {
                    $idx = ((int) $num) - 1;
                }
            }
            if ($cat !== null) {
                $result[$idx] = $cat;
            }
        }

        return $result;
    }

    /**
     * Pending (uncached) pair count, for progress UI.
     */
    public function pendingCount(): int
    {
        $pairs = $this->distinctPairs();
        $hashes = array_values(array_unique(
            array_map(fn ($p) => $this->hashPair($p['item'], $p['purpose']), $pairs)
        ));
        if (empty($hashes)) {
            return 0;
        }

        $existing = CashPurposeCategory::query()
            ->whereIn('purpose_hash', $hashes)
            ->count();

        return max(0, count($hashes) - $existing);
    }
}
