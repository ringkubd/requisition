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
import autoMergeLevel2 from "reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel2";
import { ProductOptionApiService } from "@/store/service/product/product_option";
import { optionSlice } from '@/store/service/options/optionSlice'
import { ProductActiveFormSlice } from "@/store/service/product/product_active_form";
import { ProductBasicFormSlice } from "@/store/service/product/product_basic_form";
import storage from 'reduxjs-toolkit-persist/lib/storage';
import { InitialRequisitionApi } from "@/store/service/requisitions/initial";
import { UserManagementApi } from "@/store/service/user/management";
import { ChangeOrganizationBranchApi } from "@/store/service/user/ChangeOrganizationBranch";
import { PurchaseRequisitionApi } from "@/store/service/requisitions/purchase";
import { PurchaseRequisitionInputChangeSlice } from "@/store/service/requisitions/purchase_requisition_input_change";
import { SuppliersApiService } from "@/store/service/suppliers";
import { PurchaseApiService } from "@/store/service/purchase";

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
];

const persistConfig = {
    key: 'root',
    storage: storage,
    stateReconciler: autoMergeLevel2,
    transforms: [],
    blacklist: [],
};


const combineReducer = combineReducers({
    users: userSlice.reducer,
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
});

const _persistedReducer = persistReducer(persistConfig, combineReducer);

const makeStore = () => configureStore({
    reducer: _persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ immutableCheck: false,
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
