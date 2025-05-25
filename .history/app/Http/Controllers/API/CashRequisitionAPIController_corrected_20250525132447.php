<?php

namespace App\Http\Controllers\API;

use App\Events\RequisitionStatusEvent;
use App\Helper\NotificationTestHelper;
use App\Models\CashRequisition;
use App\Models\Department;
use App\Models\OneTimeLogin;
use App\Models\User;
use App\Notifications\CeoMailNotification;
use App\Notifications\PushNotification;
use App\Notifications\RequisitionStatusNotification;
use App\Notifications\WhatsAppDepartmentNotification;
use App\Notifications\WhatsAppNotification;
use App\Repositories\CashRequisitionRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CashRequisitionResource;
use App\Notifications\WhatsAppAccountNotification;
use Illuminate\Support\Facades\DB;
use NotificationChannels\WhatsApp\Component;
use NotificationChannels\WhatsApp\Component\QuickReplyButton;
