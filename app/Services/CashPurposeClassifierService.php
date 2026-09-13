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
     * Normalise an item name: drop parenthetical qualifiers (vehicle/serial numbers)
     * so variants such as "Octane (53-7477)" and "Octane" classify consistently.
     */
    public function baseItem(string $item): string
    {
        $s = preg_replace('/\([^)]*\)/u', ' ', (string) $item);
        $s = preg_replace('/\s+/u', ' ', (string) $s);
        $s = trim((string) $s, " \t\n\r\0\x0B,-/");

        return $s === '' ? trim((string) $item) : $s;
    }

    /**
     * Distinct base items with a few representative (ditto-resolved) purposes as context.
     *
     * @return array<int,array{item:string,purposes:array<int,string>,count:int}>
     */
    public function distinctItems(int $purposeSample = 3): array
    {
        $rows = DB::table('cash_requisition_items')
            ->whereNull('deleted_at')
            ->orderBy('cash_requisition_id')
            ->orderBy('id')
            ->select('cash_requisition_id', 'id', 'item', 'purpose')
            ->get();

        $lastPurpose = [];
        $items = [];

        foreach ($rows as $row) {
            $item = $this->baseItem((string) $row->item);
            $purpose = trim((string) $row->purpose);

            if ($this->isDitto($purpose)) {
                $purpose = $lastPurpose[$row->cash_requisition_id] ?? '';
            } else {
                $lastPurpose[$row->cash_requisition_id] = $purpose;
            }

            if ($item === '') {
                continue;
            }

            if (!isset($items[$item])) {
                $items[$item] = ['item' => $item, 'purposes' => [], 'count' => 0];
            }
            $items[$item]['count']++;
            if (
                $purpose !== ''
                && !in_array($purpose, $items[$item]['purposes'], true)
                && count($items[$item]['purposes']) < $purposeSample
            ) {
                $items[$item]['purposes'][] = $purpose;
            }
        }

        return array_values($items);
    }

    /**
     * Resolve effective purposes for a set of item rows.
     * Rows must include id, cash_requisition_id and purpose, ordered by requisition then id.
     *
     * @return array<int,string> map of item row id => effective purpose
     */
    public function resolveEffectivePurposes($rows): array
    {
        $map = [];
        $lastPurpose = [];

        foreach ($rows as $row) {
            $purpose = trim((string) $row->purpose);
            if ($this->isDitto($purpose)) {
                $purpose = $lastPurpose[$row->cash_requisition_id] ?? '';
            } else {
                $lastPurpose[$row->cash_requisition_id] = $purpose;
            }
            $map[$row->item_row_id ?? $row->id] = $purpose;
        }

        return $map;
    }

    /**
     * Whether a purpose is a "ditto" placeholder meaning "same as above".
     */
    public function isDitto(string $purpose): bool
    {
        $p = mb_strtolower(trim($purpose));
        $p = rtrim($p, ". \t\n\r\0\x0B");

        return in_array($p, ['do', 'ditto', 'as above', 'same', 'same as above', '-do-'], true);
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
     * Stable hash for an item name (classification is per item for consistency).
     */
    public function hashItem(string $item): string
    {
        $normalize = fn ($v) => mb_strtolower(trim(preg_replace('/\s+/u', ' ', (string) $v)));

        return sha1($normalize($this->baseItem($item)));
    }

    /**
     * Classify all uncached items into the approved categories.
     *
     * @return array{total:int,classified:int,failed:int,pending:int}
     */
    public function classifyPending(bool $force = false): array
    {
        $categories = $this->approvedCategories();
        if (empty($categories)) {
            return ['total' => 0, 'classified' => 0, 'failed' => 0, 'pending' => 0];
        }

        $items = $this->distinctItems();
        $hashes = [];
        foreach ($items as $item) {
            $hashes[$this->hashItem($item['item'])] = $item;
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
                foreach (array_values($batch) as $index => $item) {
                    $category = $map[$index] ?? null;
                    if (!$category || !in_array($category, $categories, true)) {
                        $failed++;
                        continue;
                    }
                    $rows[] = [
                        'purpose_hash' => $this->hashItem($item['item']),
                        'item' => $item['item'],
                        'purpose' => implode(' ; ', $item['purposes'] ?? []),
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
                Log::warning('Cash item classification batch failed', [
                    'error' => $e->getMessage(),
                ]);
                $failed += count($batch);
            }
        }

        return [
            'total' => count($items),
            'classified' => $classified,
            'failed' => $failed,
            'pending' => max(0, count($items) - count($existing) - $classified),
        ];
    }

    /**
     * Classify one batch of items. Keys of the returned map are the input indices.
     *
     * @param  array<int,array{item:string,purposes?:array<int,string>}>  $items
     * @return array<int,string>
     */
    public function classifyBatch(array $items, array $categories): array
    {
        $list = [];
        foreach (array_values($items) as $i => $item) {
            $ctx = !empty($item['purposes'])
                ? ' | example purposes: ' . implode(' ; ', $item['purposes'])
                : '';
            $list[] = ($i + 1) . '. Item: ' . $item['item'] . $ctx;
        }

        $system = 'You are an expense classifier for cash requisitions (petty cash) of IsDB-BISEW, Bangladesh. '
            . 'Every item MUST be assigned to exactly one category from this exact list: ['
            . implode(', ', $categories) . ']. '
            . 'Guidance: octane/petrol/diesel/CNG/fuel -> Fuel; vehicle servicing, spare parts, tyres, engine work '
            . '-> Vehicle Maintenance; tax token, toll, fare, bus/train/air ticket, taxi -> Transportation; '
            . 'mobile bill/allowance, internet, SIM, recharge -> Mobile & Internet; electricity, water, gas bills '
            . '-> Utilities; printing, stationery, photocopy -> Printing & Stationery; building/equipment repair, '
            . 'renovation, servicing -> Repairs & Maintenance; food, snacks, tea, meeting refreshment -> '
            . 'Entertainment & Refreshment; training, workshop, seminar -> Training & Workshop; salary, allowance, '
            . 'Eid, staff welfare -> Staff Welfare & Allowance; office supplies, stationery, small equipment -> '
            . 'Office Supplies; professional fees, legal, audit, consultancy, service bills -> Professional & '
            . 'Service Bills; medicine, treatment -> Medical & Healthcare; anything unclear -> Miscellaneous. '
            . 'Reply with ONLY a JSON object mapping each item number (as a string) to one category name from the '
            . 'list. Do not invent categories.';

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
     * Pending (uncached) item count, for progress UI.
     */
    public function pendingCount(): int
    {
        $items = $this->distinctItems();
        $hashes = array_values(array_unique(
            array_map(fn ($p) => $this->hashItem($p['item']), $items)
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
