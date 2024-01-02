import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { userSlice } from "@/store/service/user";
import { OrganizationApiService } from "@/store/service/organization";
import { createWrapper } from "next-redux-wrapper";
import { BranchApiService } from "@/store/service/branch";
import { CategoryApiService } from "@/store/service/category";
import { OptionsApiService } from "@/store/service/options";
import { DesignationApiService } from "@/store/service/designation";
import { DepartmentApiService } from "@/store/service/deparment";
import { ProductApiService } from "@/store/service/product/product";
import { productMetaSlice } from "@/store/service/product/productMetaSlice";
import {
    FLUSH,
    persistReducer,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    persistStore
} from "reduxjs-toolkit-persist";
import autoMergeLevel1 from "reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1";
import { ProductOptionApiService } from "@/store/service/product/product_option";
import { optionSlice } from '@/store/service/options/optionSlice'
import { ProductActiveFormSlice } from "@/store/service/product/product_active_form";
import { ProductBasicFormSlice } from "@/store/service/product/product_basic_form";

import { InitialRequisitionApi } from "@/store/service/requisitions/initial";
import { UserManagementApi } from "@/store/service/user/management";
import { ChangeOrganizationBranchApi } from "@/store/service/user/ChangeOrganizationBranch";
import { PurchaseRequisitionApi } from "@/store/service/requisitions/purchase";
import { PurchaseRequisitionInputChangeSlice } from "@/store/service/requisitions/purchase_requisition_input_change";
import { SuppliersApiService } from "@/store/service/suppliers";
import { PurchaseApiService } from "@/store/service/purchase";
import { IssueApiService } from "@/store/service/issue";
import { BrandsApiService } from "@/store/service/brands";
import storage from "@/store/persistStorage";
import { CountryApiService } from "@/store/service/country";
import { UnitsApiService } from "@/store/service/units";
import { RolesApiService } from "@/store/service/roles";
import { PermissionsApiService } from "@/store/service/permissions";
import { errorSlice } from "@/store/slice/errorSlice";
import { NavigationAPIService } from "@/store/service/navigation";
import { CashRequisitionAPIService } from "@/store/service/cash/Index";
import DashboardSlice from "@/store/slice/dashboardSlice";
import ActivitySlice from "@/store/slice/activitySlice";
import { ReportAPI } from "@/store/service/report";
import { UserOnlineSlice } from "@/store/slice/userOnlineSlice";
import { DashboardAPI } from "@/store/service/dashboard";

const middlewares = [
    OrganizationApiService.middleware,
    BranchApiService.middleware,
    CategoryApiService.middleware,
    OptionsApiService.middleware,
    DesignationApiService.middleware,
    DepartmentApiService.middleware,
    ProductApiService.middleware,
    ProductOptionApiService.middleware,
    InitialRequisitionApi.middleware,
    UserManagementApi.middleware,
    ChangeOrganizationBranchApi.middleware,
    PurchaseRequisitionApi.middleware,
    SuppliersApiService.middleware,
    PurchaseApiService.middleware,
    IssueApiService.middleware,
    BrandsApiService.middleware,
    CountryApiService.middleware,
    UnitsApiService.middleware,
    RolesApiService.middleware,
    PermissionsApiService.middleware,
    NavigationAPIService.middleware,
    CashRequisitionAPIService.middleware,
    ReportAPI.middleware,
    DashboardAPI.middleware,
];

const persistConfig = {
    key: 'root',
    storage: storage,
    stateReconciler: autoMergeLevel1,
    transforms: [],
    blacklist: [],
};


const combineReducer = combineReducers({
    users: userSlice.reducer,
    errors: errorSlice.reducer,
    dashboard: DashboardSlice.reducer,
    activity: ActivitySlice.reducer,
    active_users: UserOnlineSlice.reducer,
    purchase_requisition_inputs: PurchaseRequisitionInputChangeSlice.reducer,
    [OrganizationApiService.reducerPath]: OrganizationApiService.reducer,
    [BranchApiService.reducerPath]: BranchApiService.reducer,
    [CategoryApiService.reducerPath]: CategoryApiService.reducer,
    [OptionsApiService.reducerPath]: OptionsApiService.reducer,
    [DesignationApiService.reducerPath]: DesignationApiService.reducer,
    [DepartmentApiService.reducerPath]: DepartmentApiService.reducer,
    [ProductApiService.reducerPath]: ProductApiService.reducer,
    product_meta: productMetaSlice.reducer,
    product_option_local: optionSlice.reducer,
    product_active_form: ProductActiveFormSlice.reducer,
    product_basic_form: ProductBasicFormSlice.reducer,
    [ProductOptionApiService.reducerPath]: ProductOptionApiService.reducer,
    [InitialRequisitionApi.reducerPath]: InitialRequisitionApi.reducer,
    [UserManagementApi.reducerPath]: UserManagementApi.reducer,
    [ChangeOrganizationBranchApi.reducerPath]: ChangeOrganizationBranchApi.reducer,
    [PurchaseRequisitionApi.reducerPath]: PurchaseRequisitionApi.reducer,
    [SuppliersApiService.reducerPath]: SuppliersApiService.reducer,
    [PurchaseApiService.reducerPath]: PurchaseApiService.reducer,
    [IssueApiService.reducerPath]: IssueApiService.reducer,
    [BrandsApiService.reducerPath]: BrandsApiService.reducer,
    [CountryApiService.reducerPath]: CountryApiService.reducer,
    [UnitsApiService.reducerPath]: UnitsApiService.reducer,
    [RolesApiService.reducerPath]: RolesApiService.reducer,
    [PermissionsApiService.reducerPath]: PermissionsApiService.reducer,
    [NavigationAPIService.reducerPath]: NavigationAPIService.reducer,
    [CashRequisitionAPIService.reducerPath]: CashRequisitionAPIService.reducer,
    [ReportAPI.reducerPath]: ReportAPI.reducer,
    [DashboardAPI.reducerPath]: DashboardAPI.reducer,
});

const _persistedReducer = persistReducer(persistConfig, combineReducer);

const makeStore = () => configureStore({
    reducer: _persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ immutableCheck: true,
        serializableCheck: {
            /* ignore persistance actions */
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

export const wrapper = createWrapper(makeStore, { debug: true });
export const store = makeStore();
export const perStore = persistStore(store);
export const dispatch = store.dispatch;
