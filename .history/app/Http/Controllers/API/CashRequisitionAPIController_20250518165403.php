<?php

namespace App\Http\Controllers\API;

use App\Events\RequisitionStatusEvent;
use App\Models\CashRequisition;
use App\Models\Department;
use App\Models\OneTimeLogin;
use App\Models\User;
use App\Notifications\CeoMailNotification;
use App\Notifications\PushNotification;
use App\Notifications\RequisitionStatusNotification;
use App\Notifications\WhatsAppCommonNotification;
use App\Notifications\WhatsAppDepartmentNotification;
use App\Notifications\WhatsAppNotification;
use App\Repositories\CashRequisitionRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CashRequisitionResource;
use Illuminate\Support\Facades\DB;
use NotificationChannels\WhatsApp\Component;
use OpenApi\Annotations as OA;

/**
 * Class CashRequisitionController
 */

class CashRequisitionAPIController extends AppBaseController
{
    /** @var  CashRequisitionRepository */
    private $cashRequisitionRepository;

    public function __construct(CashRequisitionRepository $cashRequisitionRepo)
    {
        $this->cashRequisitionRepository = $cashRequisitionRepo;
    }

    /**
     * @OA\Get(
     *      path="/cash-requisitions",
     *      summary="getCashRequisitionList",
     *      tags={"CashRequisition"},
     *      description="Get all CashRequisitions",
     *      @OA\Response(
     *          response=200,
     *          description="successful operation",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="success",
     *                  type="boolean"
     *              ),
     *              @OA\Property(
     *                  property="data",
     *                  type="array",
     *                  @OA\Items(ref="#/components/schemas/CashRequisition")
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $cashRequisitions = $this->cashRequisitionRepository->allQuery(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        )
            ->when($request->date, function ($q, $date) {
                $q->whereRaw("date(created_at) = '$date'");
            })
            ->when($request->search, function ($q, $v) {
                $q->whereHas('cashRequisitionItems', function ($w) use ($v) {
                    $w->where('item', 'like', "%$v%")->orWhere('purpose', 'like', "%$v%");
                });
            })
            ->where('department_id', auth_department_id())
            ->where('branch_id', auth_branch_id())
            ->latest()
            ->get();

        return $this->sendResponse(
            CashRequisitionResource::collection($cashRequisitions),
            __('messages.retrieved', ['model' => __('models/cashRequisitions.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/cash-requisitions",
     *      summary="createCashRequisition",
     *      tags={"CashRequisition"},
     *      description="Create CashRequisition",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/CashRequisition")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="successful operation",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="success",
     *                  type="boolean"
     *              ),
     *              @OA\Property(
     *                  property="data",
     *                  ref="#/components/schemas/CashRequisition"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
        $prf_no = $this->newPRFNO();
        $cashRequisition = $this->cashRequisitionRepository->create([
            'ir_no' => 5,
            'prf_no' => $prf_no,
            'total_cost' => collect($input)->sum('cost'),
            'user_id' => $request->user()->id,
            'branch_id' => auth_branch_id(),
            'department_id' => auth_department_id()
        ]);
        $newItems = collect($input)->map(function ($a) {
            return collect($a)->except(['cost']);
        });
        $cashRequisition->cashRequisitionItems()->createMany($newItems->toArray());
        $cashRequisition->prfNOS()->create([
            'prf_no' => $prf_no,
            'total' => collect($input)->sum('cost')
        ]);
        $cashRequisition->approval_status()->create([
            'department_id' => auth_department_id(),
            'department_status' => 1,
        ]);

        $requisitor_name = $request->user()->name;
        $head_of_department = User::find(Department::find(auth_department_id())->head_of_department);
        if (!empty($head_of_department)) {
            $head_of_department->notify(new PushNotification(
                "A purchase requisition is initiated.",
                "$requisitor_name generated a cash requisition P.R. No. $prf_no. Please approve or reject it.",
                $cashRequisition
            ));

            // $head_of_department->notify(new RequisitionStatusNotification($cashRequisition));
            if (!empty($head_of_department->mobile_no)) {
                $head_of_department->notify(new WhatsAppCommonNotification(
                    Component::text("Requisitor Name: $requisitor_name,  P.R. NO.: $prf_no."),
                    $head_of_department->mobile_no
                ));
                // $head_of_department->notify(
                //     new WhatsAppDepartmentNotification(
                //         Component::text($requisitor_name),
                //         Component::text($cashRequisition->prf_no),
                //         Component::quickReplyButton([$cashRequisition->id . '_' . $head_of_department->id . '_2_department_cash']),
                //         Component::quickReplyButton([$cashRequisition->id . '_' . $head_of_department->id . '_3_department_cash']),
                //         Component::urlButton(["/cash-requisition/$cashRequisition->id/whatsapp_view?auth_key=" . OneTimeLogin::generate($head_of_department->id)->auth_key]),
                //         $head_of_department->mobile_no
                //     )
                // );
                $head_of_department->notify(
                    new WhatsAppDepartmentNotification(
                        Component::text($requisitor_name),
                        Component::text($cashRequisition->prf_no),
                        Component::quickReplyButton([$cashRequisition->id . '_' . $head_of_department->id . '_2_department_cash']),
                        Component::quickReplyButton([$cashRequisition->id . '_' . $head_of_department->id . '_3_department_cash']),
                        Component::urlButton(["/cash-requisition/$cashRequisition->id/whatsapp_view?auth_key=" . OneTimeLogin::generate($head_of_department->id)->auth_key]),
                        '+8801737956549'
                    )
                );
            }
        }

        return $this->sendResponse(
            new CashRequisitionResource($cashRequisition),
            __('messages.saved', ['model' => __('models/cashRequisitions.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/cash-requisitions/{id}",
     *      summary="getCashRequisitionItem",
     *      tags={"CashRequisition"},
     *      description="Get CashRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisition",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="successful operation",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="success",
     *                  type="boolean"
     *              ),
     *              @OA\Property(
     *                  property="data",
     *                  ref="#/components/schemas/CashRequisition"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function show($id): JsonResponse
    {
        /** @var CashRequisition $cashRequisition */
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashRequisitions.singular')])
            );
        }

        return $this->sendResponse(
            new CashRequisitionResource($cashRequisition),
            __('messages.retrieved', ['model' => __('models/cashRequisitions.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/cash-requisitions/{id}",
     *      summary="updateCashRequisition",
     *      tags={"CashRequisition"},
     *      description="Update CashRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisition",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/CashRequisition")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="successful operation",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="success",
     *                  type="boolean"
     *              ),
     *              @OA\Property(
     *                  property="data",
     *                  ref="#/components/schemas/CashRequisition"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, Request $request): JsonResponse
    {
        $input = $request->all();
        /** @var CashRequisition $cashRequisition */
        $cashRequisition = $this->cashRequisitionRepository->find($id);
        if (empty($cashRequisition)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashRequisitions.singular')])
            );
        }
        DB::transaction(function () use ($id, $input, $cashRequisition) {
            $cashRequisition = $this->cashRequisitionRepository->update([
                'total_cost' => collect($input)->sum('cost')
            ], $id);

            $newItems = collect($input)->map(function ($a) {
                return collect($a)->except(['cost', 'id']);
            });

            if ($cashRequisition) {
                $cashRequisition->cashRequisitionItems()->delete();
                $cashRequisition->cashRequisitionItems()->createMany($newItems->toArray());
            }
        });

        return $this->sendResponse(
            new CashRequisitionResource($cashRequisition),
            __('messages.updated', ['model' => __('models/cashRequisitions.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/cash-requisitions/{id}",
     *      summary="deleteCashRequisition",
     *      tags={"CashRequisition"},
     *      description="Delete CashRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisition",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="successful operation",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="success",
     *                  type="boolean"
     *              ),
     *              @OA\Property(
     *                  property="data",
     *                  type="string"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function destroy($id): JsonResponse
    {
        /** @var CashRequisition $cashRequisition */
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashRequisitions.singular')])
            );
        }
        DB::transaction(function () use ($cashRequisition) {
            $cashRequisition->cashRequisitionItems()->delete();
            $cashRequisition->delete();
        });
        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/cashRequisitions.singular')])
        );
    }

    /**
     * @param Request $request
     * @param CashRequisition $requisition
     * @return JsonResponse|void
     */

    public function changeStatusDepartment(Request $request, CashRequisition $requisition)
    {
        $head_of_department = $requisition->department?->head_of_department;
        $head_of_department_user = User::find($head_of_department);
        if ($head_of_department) {
            $data = [
                'department_id' => $requisition->department_id,
                'notes' => $request->notes
            ];
            $notifiedUsers = [];
            switch ($request->stage) {
                case 'accounts':
                    $data['accounts_status'] = $request->status;
                    if ($request->status == 2) {
                        $data['accounts_approved_by'] = \request()->user()->id;
                        $data['ceo_status'] = 1;
                        $data['accounts_approved_at'] = now();

                        $ceo = User::query()
                            ->whereHas('organizations', function ($q) {
                                $q->where('id', auth_organization_id());
                            })
                            ->whereHas('designations', function ($q) {
                                $q->where('name', 'CEO');
                            })->first();
                        if ($ceo) {
                            $requisitor_name = $requisition->user;
                            $user = $request->user();
                            $one_time_key = new OneTimeLogin();
                            $key = $one_time_key->generate($ceo->id);
                            //                            $ceo->notify(new CeoMailNotification($requisition));
                            if (!config('app.debug')) {
                                $ceo->notify(
                                    new WhatsAppNotification(
                                        Component::text("Requisitor Name: $requisitor_name->name,  P.R. NO.: $requisition->prf_no."),
                                        $ceo->mobile_no,
                                        Component::urlButton(["/cash-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]),
                                        Component::quickReplyButton([$requisition->id . '_' . $user->id . '_2_ceo_cash']),
                                        Component::quickReplyButton([$requisition->id . '_' . $user->id . '_3_ceo_cash']),
                                    )
                                );
                                $ceo->notify(
                                    new WhatsAppNotification(
                                        Component::text("Requisitor Name: $requisitor_name->name,  P.R. NO.: $requisition->prf_no."),
                                        '+8801725271724',
                                        Component::urlButton(["/cash-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]),
                                        Component::quickReplyButton([$requisition->id . '_' . $user->id . '_2_ceo_cash']),
                                        Component::quickReplyButton([$requisition->id . '_' . $user->id . '_3_ceo_cash']),
                                    )
                                );
                                $ceo->notify(
                                    new WhatsAppNotification(
                                        Component::text("Requisitor Name: $requisitor_name->name,  P.R. NO.: $requisition->prf_no."),
                                        '+8801737956549',
                                        Component::urlButton(["/cash-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]),
                                        Component::quickReplyButton([$requisition->id . '_' . $user->id . '_2_ceo_cash']),
                                        Component::quickReplyButton([$requisition->id . '_' . $user->id . '_3_ceo_cash']),
                                    )
                                );
                            }
                        };
                    }
                    break;
                case 'ceo':
                    $data['ceo_status'] = $request->status;
                    if ($request->status == 2) {
                        $data['ceo_approved_at'] = now();
                        $notifiedUsers[] = $requisition->user;
                        $notifiedUsers[] = User::whereHas('organizations', function ($q) {
                            $q->where('id', auth_organization_id());
                        })
                            ->whereHas('roles', function ($q) {
                                $q->where('name', 'Store Manager');
                            })->first();
                    }

                    break;
                default:
                    $data['department_status'] = $request->status;
                    if ($request->status == 2) {
                        $data['department_approved_by'] = \request()->user()->id;
                        $data['department_approved_at'] = now();
                        $data['accounts_status'] = 1;
                        $department = Department::query()->where('branch_id', auth_branch_id())->where('name', 'Accounts')->with('users')->first();
                        if (!empty($department)) {
                            foreach ($department->users as $user) {
                                if ($user->hasPermissionTo('accounts-approval-purchase')) {
                                    $notifiedUsers[] = $user;
                                }
                            }
                        }
                    }
            }
            if ($requisition->approval_status) {
                $requisition->approval_status()->update($data);
            } else {
                $requisition->approval_status()->updateOrCreate($data);
            }
            broadcast(new RequisitionStatusEvent(new CashRequisitionResource($requisition), [$requisition->user, $request->user()]));

            foreach ($notifiedUsers as $notifiedUser) {
                $requisitor = $requisition->user->name;
                $notifiedUser->notify(new PushNotification(
                    "A purchase requisition has been generated and for your approval.",
                    "$requisitor is generated an requisition P.R. NO. $requisition->prf_no against I.R.F. NO. $requisition->irf_no. Please review and approve.",
                    $requisition
                ));
                $notifiedUser->notify(new RequisitionStatusNotification($requisition));

                //Accounts WhatsApp Notification
                // if (!empty($notifiedUser->mobile_no)) {
                //     $notifiedUser->notify(new WhatsAppDepartmentNotification(
                //         Component::text($requisitor),
                //         Component::text($requisition->prf_no),
                //         Component::quickReplyButton([$requisition->id . '_' . $notifiedUser->id . '_2_department_cash']),
                //         Component::quickReplyButton([$requisition->id . '_' . $notifiedUser->id . '_3_department_cash']),
                //         Component::urlButton(["/cash-requisition/$requisition->id/whatsapp_view?auth_key=" . OneTimeLogin::generate($notifiedUser->id)->auth_key]),
                //         $notifiedUser->mobile_no
                //     ));
                // }
            }

            return $this->sendResponse(
                new CashRequisitionResource($requisition),
                __('messages.retrieved', ['model' => __('models/initialRequisitionProducts.plural')])
            );
        }
    }

    public function copy($id, Request $request): JsonResponse
    {
        $prf_no = $this->newPRFNO();
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        $cashRequisition = $this->cashRequisitionRepository->create([
            'ir_no' => 5,
            'prf_no' => $prf_no,
            'total_cost' => $cashRequisition->total_cost,
            'user_id' => $request->user()->id,
            'branch_id' => auth_branch_id(),
            'department_id' => auth_department_id()
        ]);
        $newItems = $cashRequisition->cashRequisitionItems->map(function ($items) {
            return [
                'item' => $items->item,
                'unit' => $items->unit,
                'required_unit' => $items->required_unit,
                'unit_price' => $items->unit_price,
                'purpose' => $items->purpose,
            ];
        });
        $cashRequisition->cashRequisitionItems()->createMany($newItems->toArray());
        $cashRequisition->prfNOS()->create([
            'prf_no' => $prf_no,
            'total' => $cashRequisition->total_cost
        ]);
        $cashRequisition->approval_status()->create([
            'department_id' => auth_department_id(),
            'department_status' => 1,
        ]);
        return $this->sendResponse(
            new CashRequisitionResource($cashRequisition),
            __('messages.saved', ['model' => __('models/cashRequisitions.singular')])
        );
    }
}
