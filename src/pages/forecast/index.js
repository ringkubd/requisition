import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import Select from "react-select";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ComposedChart,
} from "recharts";
import {
    useCheckMLHealthQuery,
    useListModelsQuery,
    useTrainCategoryMutation,
    useTrainAllMutation,
    useTrainCategoryAsyncMutation,
    useTrainAllAsyncMutation,
    useGetTrainingStatusQuery,
    useLazyGetTrainingStatusQuery,
    useLazyForecastCategoryQuery,
    useLazyForecastAllQuery,
} from "@/store/service/mlApi";
import { useGetProductQuery } from "@/store/service/product/product";
import { useGetCategoryQuery } from "@/store/service/category";
import { useAuth } from "@/hooks/auth";

const MLForecastPage = () => {
    const { user } = useAuth();

    // State
    const [operationMode, setOperationMode] = useState("category"); // 'category', 'all'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [forecastPeriods, setForecastPeriods] = useState(6);
    const [frequency, setFrequency] = useState({
        value: "M",
        label: "Monthly",
    });
    const [trainingStatus, setTrainingStatus] = useState(null);
    const [trainingJobId, setTrainingJobId] = useState(null);
    const [trainingProgress, setTrainingProgress] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [batchResults, setBatchResults] = useState(null);

    // API Queries
    const {
        data: mlHealth,
        isLoading: healthLoading,
    } = useCheckMLHealthQuery();
    const { data: modelsData, refetch: refetchModels } = useListModelsQuery();
    const { data: productsData } = useGetProductQuery({ perPage: 1000 });
    const { data: categoriesData } = useGetCategoryQuery({ perPage: 100 });

    // Training job status polling
    const { data: jobStatus } = useGetTrainingStatusQuery(trainingJobId, {
        skip: !trainingJobId,
    });

    useEffect(() => {
        // Reset forecast data when product changes
        console.log(productsData);
    }, [productsData]);

    // Update progress when job status changes
    useEffect(() => {
        if (jobStatus) {
            setTrainingProgress(jobStatus);

            // Auto-complete when done
            if (
                jobStatus.status === "completed" ||
                jobStatus.status === "failed"
            ) {
                setTrainingStatus(jobStatus.status);
                setTrainingJobId(null); // Stop polling

                if (jobStatus.status === "completed") {
                    refetchModels();
                    const summary = jobStatus.summary;
                    alert(
                        `Training completed!\nTotal products: ${summary.total}\nSuccessful: ${summary.successful}\nFailed: ${summary.failed}\nPending: ${summary.pending}`
                    );
                } else {
                    alert(`Training failed: ${jobStatus.error}`);
                }
            }
        }
    }, [jobStatus]);

    // Mutations
    const [
        trainCategory,
        { isLoading: isTrainingCategory },
    ] = useTrainCategoryMutation();
    const [trainAll, { isLoading: isTrainingAll }] = useTrainAllMutation();
    const [
        trainCategoryAsync,
        { isLoading: isTrainingCategoryAsync },
    ] = useTrainCategoryAsyncMutation();
    const [
        trainAllAsync,
        { isLoading: isTrainingAllAsync },
    ] = useTrainAllAsyncMutation();
    const [
        getForecastCategory,
        { isLoading: isForecastCategoryLoading },
    ] = useLazyForecastCategoryQuery();
    const [
        getForecastAll,
        { isLoading: isForecastAllLoading },
    ] = useLazyForecastAllQuery();

    // Format options for selects
    const categoryOptions =
        categoriesData?.data?.map((cat) => ({
            value: cat.id,
            label: cat.title,
        })) || [];

    const productOptions =
        productsData?.data
            ?.filter(
                (p) =>
                    !selectedCategory ||
                    p.category_id === selectedCategory.value
            )
            ?.flatMap(
                (product) =>
                    product.product_options?.map((option) => ({
                        value: option.id,
                        label: `${product.title}${
                            option.option_value !== "NA" &&
                            option.option_value !== "N/A"
                                ? " - " + option.option_value
                                : ""
                        }`,
                        product_id: product.id,
                        product_option_id: option.id,
                        product: product,
                    })) || []
            ) || [];

    const frequencyOptions = [
        { value: "D", label: "Daily" },
        { value: "W", label: "Weekly" },
        { value: "M", label: "Monthly" },
        { value: "Q", label: "Quarterly" },
        { value: "Y", label: "Yearly" },
    ];

    // Handle train model
    const handleTrainModel = async () => {
        setTrainingStatus("training");
        setBatchResults(null);
        setTrainingProgress(null);

        try {
            let result;

            if (operationMode === "category") {
                if (!selectedCategory) return;

                result = await trainCategoryAsync({
                    category_id: selectedCategory.value,
                    aggregation:
                        frequency.value.toLowerCase() === "d"
                            ? "daily"
                            : frequency.value.toLowerCase() === "w"
                            ? "weekly"
                            : "monthly",
                }).unwrap();

                // Start polling for job status
                setTrainingJobId(result.job_id);
                alert(
                    `Training job queued!\nJob ID: ${result.job_id}\nYou will see progress updates below.`
                );
            } else if (operationMode === "all") {
                result = await trainAllAsync({
                    aggregation:
                        frequency.value.toLowerCase() === "d"
                            ? "daily"
                            : frequency.value.toLowerCase() === "w"
                            ? "weekly"
                            : "monthly",
                }).unwrap();

                // Start polling for job status
                setTrainingJobId(result.job_id);
                alert(
                    `Training job queued!\nJob ID: ${result.job_id}\nYou will see progress updates below.`
                );
            }
        } catch (error) {
            setTrainingStatus("error");
            setTrainingJobId(null);
            alert(
                `Failed to queue training: ${
                    error?.data?.message || "Unknown error"
                }`
            );
        }
    };

    // Handle get forecast
    const handleGetForecast = async () => {
        try {
            let result;

            if (operationMode === "category") {
                if (!selectedCategory) return;

                result = await getForecastCategory({
                    category_id: selectedCategory.value,
                    periods: forecastPeriods,
                    frequency: frequency.value,
                    include_history: true,
                    force_refresh: false,
                }).unwrap();

                if (result.status === "success" && result.forecasts) {
                    setForecastData({
                        forecasts: result.forecasts,
                        summary: result.summary,
                        mode: "category",
                    });
                }
            } else if (operationMode === "all") {
                result = await getForecastAll({
                    periods: forecastPeriods,
                    frequency: frequency.value,
                    include_history: true,
                    force_refresh: false,
                }).unwrap();

                if (result.status === "success" && result.forecasts) {
                    setForecastData({
                        forecasts: result.forecasts,
                        summary: result.summary,
                        mode: "all",
                    });
                }
            }
        } catch (error) {
            alert(
                `Forecast failed: ${error?.data?.message || "Unknown error"}`
            );
        }
    };

    return (
        <>
            <Head>
                <title>ML Inventory Forecasting - Requisition</title>
            </Head>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        📊 ML Inventory Forecasting
                    </h1>
                    <p className="text-gray-600">
                        Predict future inventory needs using machine learning
                    </p>
                </div>

                {/* ML Service Status */}
                <div className="mb-6 p-4 rounded-lg border bg-white shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg mb-1">
                                ML Service Status
                            </h3>
                            {healthLoading ? (
                                <p className="text-gray-500">Checking...</p>
                            ) : mlHealth?.status === "success" ? (
                                <p className="text-green-600">
                                    ✓ Service is running (
                                    {modelsData?.data?.total_models || 0} models
                                    trained)
                                </p>
                            ) : (
                                <p className="text-red-600">
                                    ✗ Service is offline
                                </p>
                            )}
                        </div>
                        {mlHealth?.ml_service?.timestamp && (
                            <span className="text-sm text-gray-500">
                                Last check:{" "}
                                {new Date(
                                    mlHealth.ml_service.timestamp
                                ).toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Operation Mode Selection */}
                <div className="mb-6 p-6 rounded-lg border bg-white shadow">
                    <h3 className="font-semibold text-lg mb-4">
                        Operation Mode
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Operation Type
                            </label>
                            <Select
                                options={[
                                    {
                                        value: "category",
                                        label: "Category Wise",
                                    },
                                    { value: "all", label: "All Products" },
                                ]}
                                value={{
                                    value: operationMode,
                                    label:
                                        operationMode === "category"
                                            ? "Category Wise"
                                            : "All Products",
                                }}
                                onChange={(option) => {
                                    setOperationMode(option.value);
                                    setSelectedProduct(null);
                                    setSelectedCategory(null);
                                    setForecastData(null);
                                    setBatchResults(null);
                                }}
                            />
                        </div>

                        {operationMode === "category" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Category *
                                </label>
                                <Select
                                    options={categoryOptions}
                                    value={selectedCategory}
                                    onChange={setSelectedCategory}
                                    placeholder="Select a category..."
                                />
                            </div>
                        )}
                    </div>

                    {operationMode === "category" && selectedCategory && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                                📊 Training/Forecasting for all products in
                                category:{" "}
                                <strong>{selectedCategory.label}</strong>
                            </p>
                        </div>
                    )}

                    {operationMode === "all" && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                                🌍 Training/Forecasting for{" "}
                                <strong>all products</strong> in the system
                            </p>
                        </div>
                    )}
                </div>

                {/* Forecast Settings */}
                <div className="mb-6 p-6 rounded-lg border bg-white shadow">
                    <h3 className="font-semibold text-lg mb-4">
                        Forecast Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Frequency
                            </label>
                            <Select
                                options={frequencyOptions}
                                value={frequency}
                                onChange={setFrequency}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Forecast Periods: {forecastPeriods}
                            </label>
                            <input
                                type="range"
                                min="3"
                                max="24"
                                value={forecastPeriods}
                                onChange={(e) =>
                                    setForecastPeriods(parseInt(e.target.value))
                                }
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>3</span>
                                <span>24</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleTrainModel}
                            disabled={
                                (operationMode === "category" &&
                                    !selectedCategory) ||
                                isTrainingCategoryAsync ||
                                isTrainingAllAsync ||
                                trainingStatus === "training"
                            }
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                            {isTrainingCategoryAsync ||
                            isTrainingAllAsync ||
                            trainingStatus === "training"
                                ? "Training..."
                                : operationMode === "category"
                                ? "🎓 Train Category"
                                : "🎓 Train All"}
                        </button>

                        <button
                            onClick={handleGetForecast}
                            disabled={
                                (operationMode === "category" &&
                                    !selectedCategory) ||
                                isForecastCategoryLoading ||
                                isForecastAllLoading
                            }
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                        >
                            {isForecastCategoryLoading || isForecastAllLoading
                                ? "Loading..."
                                : "🔮 Get Forecast"}
                        </button>
                    </div>
                </div>

                {/* Forecast Results */}
                {forecastData && (
                    <div className="mb-6 p-6 rounded-lg border bg-white shadow">
                        <h3 className="font-semibold text-lg mb-4">
                            Forecast Results
                            {forecastData.mode && (
                                <span className="text-sm text-gray-500 ml-2">
                                    (
                                    {forecastData.mode === "category"
                                        ? "Category Wise"
                                        : "All Products"}
                                    )
                                </span>
                            )}
                        </h3>

                        {/* Category/All Products Summary */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                            <h4 className="font-semibold mb-2">
                                Summary:{" "}
                                {forecastData.summary?.total_products || 0}{" "}
                                Products
                            </h4>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">
                                        Total:
                                    </span>
                                    <span className="ml-2 font-semibold">
                                        {forecastData.summary?.total_products ||
                                            0}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">
                                        Successful:
                                    </span>
                                    <span className="ml-2 font-semibold text-green-600">
                                        {forecastData.summary?.successful || 0}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">
                                        Failed:
                                    </span>
                                    <span className="ml-2 font-semibold text-red-600">
                                        {forecastData.summary?.failed || 0}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">
                                        Periods:
                                    </span>
                                    <span className="ml-2 font-semibold">
                                        {forecastData.summary?.periods || 0}{" "}
                                        {forecastData.summary?.frequency || ""}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Products Forecast Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Next Month Forecast
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            3-Month Avg
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Trend
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {forecastData.forecasts?.map(
                                        (forecast, idx) => {
                                            if (forecast.error) {
                                                return (
                                                    <tr
                                                        key={idx}
                                                        className="bg-red-50"
                                                    >
                                                        <td className="px-4 py-3 text-sm font-medium">
                                                            {forecast.product_name ||
                                                                `Product ${forecast.product_id}`}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-red-600">
                                                            Failed
                                                        </td>
                                                        <td
                                                            colSpan="3"
                                                            className="px-4 py-3 text-sm text-red-600"
                                                        >
                                                            {forecast.error}
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            const nextMonth = forecast.predictions?.find(
                                                (p) => p.is_forecast
                                            );
                                            const threeMonthAvg =
                                                forecast.predictions
                                                    ?.filter(
                                                        (p) => p.is_forecast
                                                    )
                                                    ?.slice(0, 3)
                                                    ?.reduce(
                                                        (sum, p) =>
                                                            sum + p.predicted,
                                                        0
                                                    ) / 3;

                                            return (
                                                <tr
                                                    key={idx}
                                                    className={
                                                        idx % 2 === 0
                                                            ? "bg-white"
                                                            : "bg-gray-50"
                                                    }
                                                >
                                                    <td className="px-4 py-3 text-sm font-medium">
                                                        {forecast.product_name ||
                                                            `Product ${forecast.product_id}`}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-green-600">
                                                        ✓ Success
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold">
                                                        {nextMonth
                                                            ? nextMonth.predicted.toFixed(
                                                                  2
                                                              )
                                                            : "N/A"}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {threeMonthAvg
                                                            ? threeMonthAvg.toFixed(
                                                                  2
                                                              )
                                                            : "N/A"}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {nextMonth &&
                                                        nextMonth.trend !==
                                                            undefined ? (
                                                            <span
                                                                className={
                                                                    nextMonth.trend >
                                                                    0
                                                                        ? "text-green-600"
                                                                        : "text-red-600"
                                                                }
                                                            >
                                                                {nextMonth.trend >
                                                                0
                                                                    ? "↗️ Rising"
                                                                    : "↘️ Falling"}
                                                            </span>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Training Progress */}
                {trainingProgress && (
                    <div className="mb-6 p-6 rounded-lg border bg-white shadow">
                        <h3 className="font-semibold text-lg mb-4">
                            Training Progress
                            <span className="text-sm text-gray-500 ml-2">
                                (Job ID: {trainingProgress.job_id})
                            </span>
                        </h3>

                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                            <h4 className="font-semibold mb-3">
                                Status:{" "}
                                <span
                                    className={
                                        trainingProgress.status === "processing"
                                            ? "text-blue-600"
                                            : trainingProgress.status ===
                                              "completed"
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }
                                >
                                    {trainingProgress.status.toUpperCase()}
                                </span>
                            </h4>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Progress</span>
                                    <span className="font-semibold">
                                        {trainingProgress.progress_percent}%
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300"
                                        style={{
                                            width: `${trainingProgress.progress_percent}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">
                                        Total:
                                    </span>
                                    <span className="ml-2 font-semibold">
                                        {trainingProgress.summary.total}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">
                                        Processed:
                                    </span>
                                    <span className="ml-2 font-semibold">
                                        {trainingProgress.summary.processed}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">
                                        Successful:
                                    </span>
                                    <span className="ml-2 font-semibold text-green-600">
                                        {trainingProgress.summary.successful}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">
                                        Failed:
                                    </span>
                                    <span className="ml-2 font-semibold text-red-600">
                                        {trainingProgress.summary.failed}
                                    </span>
                                </div>
                                {trainingProgress.estimated_seconds_remaining && (
                                    <div className="col-span-4">
                                        <span className="text-gray-600">
                                            Estimated time remaining:
                                        </span>
                                        <span className="ml-2 font-semibold">
                                            {Math.floor(
                                                trainingProgress.estimated_seconds_remaining /
                                                    60
                                            )}
                                            m{" "}
                                            {trainingProgress.estimated_seconds_remaining %
                                                60}
                                            s
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Results */}
                        {trainingProgress.recent_results &&
                            trainingProgress.recent_results.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Recent Results
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {trainingProgress.recent_results.map(
                                                (result, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className={
                                                            idx % 2 === 0
                                                                ? "bg-white"
                                                                : "bg-gray-50"
                                                        }
                                                    >
                                                        <td className="px-4 py-3 text-sm font-medium">
                                                            {result.product_name ||
                                                                `Product ${result.product_id}`}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span
                                                                className={
                                                                    result.status ===
                                                                    "success"
                                                                        ? "text-green-600"
                                                                        : "text-red-600"
                                                                }
                                                            >
                                                                {result.status ===
                                                                "success"
                                                                    ? "✓ Success"
                                                                    : "✗ Failed"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                    </div>
                )}

                {/* Batch Training Results */}
                {batchResults && (
                    <div className="mb-6 p-6 rounded-lg border bg-white shadow">
                        <h3 className="font-semibold text-lg mb-4">
                            Training Results
                        </h3>

                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                            <h4 className="font-semibold mb-2">Summary</h4>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">
                                        Total:
                                    </span>
                                    <span className="ml-2 font-semibold">
                                        {batchResults.summary.total_products}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">
                                        Successful:
                                    </span>
                                    <span className="ml-2 font-semibold text-green-600">
                                        {batchResults.summary.successful}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">
                                        Failed:
                                    </span>
                                    <span className="ml-2 font-semibold text-red-600">
                                        {batchResults.summary.failed}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">
                                        Duration:
                                    </span>
                                    <span className="ml-2 font-semibold">
                                        ~
                                        {batchResults.summary.total_products *
                                            30}
                                        s
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Message
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {batchResults.results?.map(
                                        (result, idx) => (
                                            <tr
                                                key={idx}
                                                className={
                                                    idx % 2 === 0
                                                        ? "bg-white"
                                                        : "bg-gray-50"
                                                }
                                            >
                                                <td className="px-4 py-3 text-sm font-medium">
                                                    {result.product_name ||
                                                        `Product ${result.product_id}`}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span
                                                        className={
                                                            result.status ===
                                                            "success"
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }
                                                    >
                                                        {result.status ===
                                                        "success"
                                                            ? "✓ Success"
                                                            : "✗ Failed"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {result.message}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                <div className="p-6 rounded-lg border bg-blue-50 border-blue-200">
                    <h3 className="font-semibold text-lg mb-2">
                        💡 How to Use
                    </h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                        <li>
                            Choose operation mode: Category Wise or All Products
                        </li>
                        <li>
                            For Category mode: Select a category to
                            train/forecast all products in that category
                        </li>
                        <li>
                            For All Products mode: Train/forecast will process
                            all products in the system
                        </li>
                        <li>
                            Click "Train Category/All" to train ML models (takes
                            time based on number of products)
                        </li>
                        <li>
                            Once trained, click "Get Forecast" to generate
                            predictions
                        </li>
                        <li>
                            View batch results with success/failure summary and
                            individual product forecasts
                        </li>
                    </ol>
                </div>
            </div>
        </>
    );
};

export default MLForecastPage;
