<?php

namespace App\Dbal;

class ProductStatus extends EnumType {
    protected $name = 'product_status';

    protected $values = array('Active', 'Inactive');
}
