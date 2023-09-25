<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'sl_no' => $this->sl_no,
            'unit' => $this->unit,
            'category_id' => $this->category_id,
            'category' => $this->category,
            'product_metas' => $this->productMetas,
            'product_options' => $this->productOptions->load('option'),
            'last_purchase' => $this->lastPurchaseRequisition,
            'description' => $this->description,
            'status' => $this->status,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
