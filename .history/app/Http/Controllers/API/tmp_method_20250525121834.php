/**
* Send WhatsApp notification to a user
*
* @param User $user The user to notify
* @param PurchaseRequisition $purchaseRequisition The requisition
* @param string $requisitorName Name of the requisitor
* @param string $prfNo Purchase Requisition Number
* @param string|null $overridePhone Optional phone number to override the user's phone
* @return void
*/
private function sendWhatsAppNotification(User $user, PurchaseRequisition $purchaseRequisition, string $requisitorName, string $prfNo, ?string $overridePhone = null): void
{
$phoneNumber = $overridePhone ?? $user->mobile_no;

if (empty($phoneNumber)) {
return;
}

// Generate one-time login key
$one_time_key = new OneTimeLogin();
$key = $one_time_key->generate($user->id);

// Send department notification with action buttons
$user->notify(
new WhatsAppDepartmentNotification(
Component::text($requisitorName),
Component::text($purchaseRequisition->prf_no),
Component::quickReplyButton([$purchaseRequisition->id . '_' . $user->id . '_2_department_purchase']),
Component::quickReplyButton([$purchaseRequisition->id . '_' . $user->id . '_3_department_purchase']),
Component::urlButton(["/purchase-requisition/$purchaseRequisition->id/whatsapp_view?auth_key=" . $key->auth_key]),
$phoneNumber
)
);
}