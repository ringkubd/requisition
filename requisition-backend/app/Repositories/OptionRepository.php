<?php

namespace App\Repositories;

use App\Models\Option;
use App\Repositories\BaseRepository;

class OptionRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'name',
        'description'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return Option::class;
    }
}
