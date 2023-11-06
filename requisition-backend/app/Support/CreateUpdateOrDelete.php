<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class CreateUpdateOrDelete
{
    protected HasMany $query;

    protected iterable $records;

    public function __construct(HasMany $query, iterable $records){
        // id (ingredient table)
        $relatedKeyName = $query->getRelated()->getKeyName();
        $allowedRecordIds = $query->pluck($relatedKeyName);

        $this->query = $query;
        $this->records = collect($records)->filter(
            function ($record) use ($relatedKeyName, $allowedRecordIds) {
                $id = $record[$relatedKeyName] ?? null;

                return $id === null || $allowedRecordIds->contains($id);
            }
        );
    }

    public function __invoke()
    {
        DB::transaction(function () {
            $this->deleteMissingRecords();

            $this->updateOrCreateRecords();
            // Or $this->upsertRecords();
        });
    }

    protected function deleteMissingRecords(): void
    {
        // id (ingredient table)
        $recordKeyName = $this->query->getRelated()->getKeyName();

        $existingRecordIds = $this->records
            ->pluck($recordKeyName)
            ->filter();

        (clone $this->query)
            ->whereNotIn($recordKeyName, $existingRecordIds)
            ->delete();
    }

    protected function updateOrCreateRecords(): void
    {
        // id (ingredient table)
        $recordKeyName = $this->query->getRelated()->getKeyName();

        $this->records->each(function ($record) use ($recordKeyName) {
            (clone $this->query)->updateOrCreate([
                $recordKeyName => $record[$recordKeyName] ?? null,
            ], $record);
        });
    }

    protected function upsertRecords(): void
    {
        $values = $this->records->map(function ($record) {
            // Set $record['recipe_id'] to parent key.
            $record[
            $this->query->getForeignKeyName()
            ] = $this->query->getParentKey();

            // Set $record['id'] to null when missing.
            $recordKeyName = $this->query->getRelated()->getKeyName();
            $record[$recordKeyName] = array_key_exists($recordKeyName, $record)
                ? $record[$recordKeyName]
                : null;

            return $record;
        })->toArray();

        (clone $this->query)->upsert(
            $values,
            [$this->query->getRelated()->getKeyName()],
        );
    }

}
