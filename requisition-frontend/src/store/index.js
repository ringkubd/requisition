import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { userSlice } from "@/store/service/user";
import { OrganizationApiService } from "@/store/service/organization";
import { createWrapper } from "next-redux-wrapper";
import { BranchApiService } from "@/store/service/branch";
import { DepartmentApiService } from "@/store/service/deparment";
import { productMetaSlice } from "@/store/service/product/productMetaSlice";
import {
    FLUSH,
    persistReducer,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    persistStore,
} from "reduxjs-toolkit-persist";
import storage from 'reduxjs-toolkit-persist/lib/storage'
// import storage from "@/store/persistStorage";
import autoMergeLevel1 from "reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1";
import { ProductOptionApiService } from "@/store/service/product/product_option";
import { optionSlice } from '@/store/service/options/optionSlice'
import { ProductActiveFormSlice } from "@/store/service/product/product_active_form";
import { ProductBasicFormSlice } from "@/store/service/product/product_basic_form";

import { UserManagementApi } from "@/store/service/user/management";
import { ChangeOrganizationBranchApi } from "@/store/service/user/ChangeOrganizationBranch";
import { PurchaseRequisitionInputChangeSlice } from "@/store/service/requisitions/purchase_requisition_input_change";
import { IssueApiService } from "@/store/service/issue";
import { CountryApiService } from "@/store/service/country";
import { RolesApiService } from "@/store/service/roles";
import { PermissionsApiService } from "@/store/service/permissions";
import { errorSlice } from "@/store/slice/errorSlice";
import DashboardSlice from "@/store/slice/dashboardSlice";
import ActivitySlice from "@/store/slice/activitySlice";
import { ReportAPI } from "@/store/service/report";
import { UserOnlineSlice } from "@/store/slice/userOnlineSlice";
import { encryptTransform } from "redux-persist-transform-encrypt";
import { FilterDateRange } from "@/store/slice/filterDateRange";
import ProductSearchSlice from "@/store/slice/productSearchSlice";
import { BaseAPI } from "@/store/service/vehicle/BaseAPI";
import {BaseAPI as RequisitionBaseAPI} from "@/store/service/requisitions/BaseAPI";
import SupplierSlice from "@/store/slice/supplierSlice";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

const middlewares = [
    OrganizationApiService.middleware,
    BranchApiService.middleware,
    ProductOptionApiService.middleware,
    UserManagementApi.middleware,
    ChangeOrganizationBranchApi.middleware,
    GeneralBaseAPI.middleware,
    IssueApiService.middleware,
    CountryApiService.middleware,
    RolesApiService.middleware,
    PermissionsApiService.middleware,
    ReportAPI.middleware,
    BaseAPI.middleware,
    RequisitionBaseAPI.middleware,
];

let transforms = null;

if (process.env.NODE_ENV === "production") {
    const encrypt = encryptTransform({
        secretKey: process.env.NEXT_PUBLIC_REDUX_SECRET,
        onError: function (error) {
            // Handle the error.
        },
    });
    transforms = [encrypt];
}

const persistConfig = {
    key: 'root',
    storage: storage,
    stateReconciler: autoMergeLevel1,
    transforms,
    blacklist: [],
};


const combineReducer = combineReducers({
    users: userSlice.reducer,
    errors: errorSlice.reducer,
    dashboard: DashboardSlice.reducer,
    activity: ActivitySlice.reducer,
    active_users: UserOnlineSlice.reducer,
    product_search: ProductSearchSlice.reducer,
    purchase_requisition_inputs: PurchaseRequisitionInputChangeSlice.reducer,
    [OrganizationApiService.reducerPath]: OrganizationApiService.reducer,
    [BranchApiService.reducerPath]: BranchApiService.reducer,
    product_meta: productMetaSlice.reducer,
    product_option_local: optionSlice.reducer,
    product_active_form: ProductActiveFormSlice.reducer,
    product_basic_form: ProductBasicFormSlice.reducer,
    [ProductOptionApiService.reducerPath]: ProductOptionApiService.reducer,
    [UserManagementApi.reducerPath]: UserManagementApi.reducer,
    [ChangeOrganizationBranchApi.reducerPath]: ChangeOrganizationBranchApi.reducer,
    [GeneralBaseAPI.reducerPath]: GeneralBaseAPI.reducer,
    [IssueApiService.reducerPath]: IssueApiService.reducer,
    [CountryApiService.reducerPath]: CountryApiService.reducer,
    [RolesApiService.reducerPath]: RolesApiService.reducer,
    [PermissionsApiService.reducerPath]: PermissionsApiService.reducer,
    [ReportAPI.reducerPath]: ReportAPI.reducer,
    supplier_search: SupplierSlice.reducer,
    filter_date_range: FilterDateRange.reducer,
    [BaseAPI.reducerPath]: BaseAPI.reducer,
    [RequisitionBaseAPI.reducerPath]: RequisitionBaseAPI.reducer,
});

const _persistedReducer = persistReducer(persistConfig, combineReducer);

const makeStore = () => configureStore({
    reducer: _persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ immutableCheck: true,
        serializableCheck: {
            /* ignore persistence actions */
            ignoredActions: [
                FLUSH,
                REHYDRATE,
                PAUSE,
                PERSIST,
                PURGE,
                REGISTER
            ],
        },}).concat(middlewares)
});

setupListeners(makeStore().dispatch);

export const wrapper = createWrapper(makeStore, process.env.NODE_ENV === 'development' ? { debug: true }: {});
export const store = makeStore();
export const perStore = persistStore(store);
export const dispatch = store.dispatch;
