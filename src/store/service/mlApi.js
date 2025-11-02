import { GeneralBaseAPI } from "../generalBaseAPI";

export const mlApi = GeneralBaseAPI.injectEndpoints({
    endpoints: (builder) => ({
        // Health check
        checkMLHealth: builder.query({
            query: () => ({
                url: "/ml/health",
                method: "GET",
            }),
        }),

        // List all trained models
        listModels: builder.query({
            query: () => ({
                url: "/ml/models",
                method: "GET",
            }),
            providesTags: ["MLModels"],
        }),

        // Train a new model
        trainModel: builder.mutation({
            query: (data) => ({
                url: "/ml/train",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["MLModels"],
        }),

        // Batch train multiple models
        batchTrainModels: builder.mutation({
            query: (data) => ({
                url: "/ml/batch-train",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["MLModels"],
        }),

        // Get forecast
        getForecast: builder.query({
            query: ({
                product_id,
                product_option_id,
                periods = 6,
                frequency = "M",
                include_history = false,
                force_refresh = false,
            }) => ({
                url: "/ml/forecast",
                method: "POST",
                body: {
                    product_id,
                    product_option_id,
                    periods,
                    frequency,
                    include_history,
                    force_refresh,
                },
            }),
        }),

        // Delete model
        deleteModel: builder.mutation({
            query: (data) => ({
                url: "/ml/models",
                method: "DELETE",
                body: data,
            }),
            invalidatesTags: ["MLModels"],
        }),

        // Get forecast data (for preview before training)
        getForecastData: builder.query({
            query: ({
                product_id,
                product_option_id,
                aggregation = "monthly",
            }) => ({
                url: "/report/forecast-data",
                method: "GET",
                params: {
                    product_id,
                    product_option_id,
                    aggregation,
                },
            }),
        }),

        // Export ML data
        exportMLData: builder.query({
            query: ({ start_date, end_date, category_id, product_id }) => ({
                url: "/report/ml-export",
                method: "GET",
                params: {
                    start_date,
                    end_date,
                    category_id,
                    product_id,
                },
            }),
        }),

        // Train models for a category
        trainCategory: builder.mutation({
            query: (data) => ({
                url: "/ml/train-category",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["MLModels"],
        }),

        // Train models for all products
        trainAll: builder.mutation({
            query: (data) => ({
                url: "/ml/train-all",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["MLModels"],
        }),

        // Get forecast for a category
        forecastCategory: builder.query({
            query: ({
                category_id,
                periods = 6,
                frequency = "M",
                include_history = true,
                force_refresh = false,
            }) => ({
                url: "/ml/forecast-category",
                method: "POST",
                body: {
                    category_id,
                    periods,
                    frequency,
                    include_history,
                    force_refresh,
                },
            }),
        }),

        // Get forecast for all products
        forecastAll: builder.query({
            query: ({
                periods = 6,
                frequency = "M",
                include_history = true,
                force_refresh = false,
            }) => ({
                url: "/ml/forecast-all",
                method: "POST",
                body: {
                    periods,
                    frequency,
                    include_history,
                    force_refresh,
                },
            }),
        }),

        // Train models for a category (async - returns job_id)
        trainCategoryAsync: builder.mutation({
            query: (data) => ({
                url: "/ml/train-category-async",
                method: "POST",
                body: data,
            }),
        }),

        // Train models for all products (async - returns job_id)
        trainAllAsync: builder.mutation({
            query: (data) => ({
                url: "/ml/train-all-async",
                method: "POST",
                body: data,
            }),
        }),

        // Get training job status
        getTrainingStatus: builder.query({
            query: (jobId) => ({
                url: `/ml/training-status/${jobId}`,
                method: "GET",
            }),
            // Poll every 2 seconds by default
            pollingInterval: 2000,
        }),
    }),
    overrideExisting: false,
});

export const {
    useCheckMLHealthQuery,
    useListModelsQuery,
    useTrainModelMutation,
    useBatchTrainModelsMutation,
    useGetForecastQuery,
    useLazyGetForecastQuery,
    useDeleteModelMutation,
    useGetForecastDataQuery,
    useLazyGetForecastDataQuery,
    useExportMLDataQuery,
    useLazyExportMLDataQuery,
    useTrainCategoryMutation,
    useTrainAllMutation,
    useTrainCategoryAsyncMutation,
    useTrainAllAsyncMutation,
    useGetTrainingStatusQuery,
    useLazyGetTrainingStatusQuery,
    useForecastCategoryQuery,
    useLazyForecastCategoryQuery,
    useForecastAllQuery,
    useLazyForecastAllQuery,
} = mlApi;
