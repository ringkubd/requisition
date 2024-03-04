import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { userSlice } from "@/store/service/user";
import { createWrapper } from "next-redux-wrapper";
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
import { optionSlice } from '@/store/service/options/optionSlice'
import { ProductActiveFormSlice } from "@/store/service/product/product_active_form";
import { ProductBasicFormSlice } from "@/store/service/product/product_basic_form";
import { PurchaseRequisitionInputChangeSlice } from "@/store/service/requisitions/purchase_requisition_input_change";
import { errorSlice } from "@/store/slice/errorSlice";
import DashboardSlice from "@/store/slice/dashboardSlice";
import ActivitySlice from "@/store/slice/activitySlice";
import { UserOnlineSlice } from "@/store/slice/userOnlineSlice";
import { encryptTransform } from "redux-persist-transform-encrypt";
import { FilterDateRange } from "@/store/slice/filterDateRange";
import ProductSearchSlice from "@/store/slice/productSearchSlice";
import SupplierSlice from "@/store/slice/supplierSlice";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

const middlewares = [
    GeneralBaseAPI.middleware,
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
    product_meta: productMetaSlice.reducer,
    product_option_local: optionSlice.reducer,
    product_active_form: ProductActiveFormSlice.reducer,
    product_basic_form: ProductBasicFormSlice.reducer,
    supplier_search: SupplierSlice.reducer,
    filter_date_range: FilterDateRange.reducer,

    [GeneralBaseAPI.reducerPath]: GeneralBaseAPI.reducer,
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

export const wrapper = createWrapper(makeStore, process.env.NODE_ENV === 'development' ? { debug: true }: {debug: false});
export const store = makeStore();
export const perStore = persistStore(store);
export const dispatch = store.dispatch;
