import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { useGetProductsQuery } from '@/store/services/product';
import { useGetCategoryQuery } from '@/store/services/categories';
import {
    useCheckMLHealthQuery,
    useListModelsQuery,
    useTrainModelMutation,
    useLazyGetForecastQuery,
    useDeleteModelMutation,
} from '@/store/services/mlApi';

const MLForecastPage = () => {
    const { data: user } = useSelector((state) => state.user);
    
    // State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [forecastPeriods, setForecastPeriods] = useState(6);
    const [frequency, setFrequency] = useState({ value: 'M', label: 'Monthly' });
    const [trainingStatus, setTrainingStatus] = useState(null);
    const [forecastData, setForecastData] = useState(null);

    // API Queries
    const { data: mlHealth, isLoading: healthLoading } = useCheckMLHealthQuery();
    const { data: modelsData, refetch: refetchModels } = useListModelsQuery();
    const { data: productsData } = useGetProductsQuery({ perPage: 1000 });
    const { data: categoriesData } = useGetCategoryQuery({ perPage: 100 });
    
    // Mutations
    const [trainModel, { isLoading: isTraining }] = useTrainModelMutation();
    const [deleteModel, { isLoading: isDeleting }] = useDeleteModelMutation();
    const [getForecast, { isLoading: isForecastLoading }] = useLazyGetForecastQuery();

    // Format options for selects
    const categoryOptions = categoriesData?.data?.map(cat => ({
        value: cat.id,
        label: cat.title,
    })) || [];

    const productOptions = productsData?.data
        ?.filter(p => !selectedCategory || p.category_id === selectedCategory.value)
        ?.flatMap(product =>
            product.product_options?.map(option => ({
                value: option.id,
                label: `${product.title}${option.option_value !== 'NA' && option.option_value !== 'N/A' ? ' - ' + option.option_value : ''}`,
                product_id: product.id,
                product_option_id: option.id,
                product: product,
            })) || []
        ) || [];

    const frequencyOptions = [
        { value: 'D', label: 'Daily' },
        { value: 'W', label: 'Weekly' },
        { value: 'M', label: 'Monthly' },
        { value: 'Q', label: 'Quarterly' },
        { value: 'Y', label: 'Yearly' },
    ];

    // Check if product has trained model
    const hasTrainedModel = () => {
        if (!selectedProduct || !modelsData?.data?.models) return false;
        return modelsData.data.models.some(
            m => m.product_id === selectedProduct.product_id && 
                 m.product_option_id === selectedProduct.product_option_id
        );
    };

    // Get model info
    const getModelInfo = () => {
        if (!selectedProduct || !modelsData?.data?.models) return null;
        return modelsData.data.models.find(
            m => m.product_id === selectedProduct.product_id && 
                 m.product_option_id === selectedProduct.product_option_id
        );
    };

    // Handle train model
    const handleTrainModel = async () => {
        if (!selectedProduct) return;

        setTrainingStatus('training');
        try {
            const result = await trainModel({
                product_id: selectedProduct.product_id,
                product_option_id: selectedProduct.product_option_id,
                aggregation: frequency.value.toLowerCase() === 'd' ? 'daily' : 
                             frequency.value.toLowerCase() === 'w' ? 'weekly' : 'monthly',
            }).unwrap();

            setTrainingStatus('success');
            alert(`Model trained successfully!\nData points: ${result.training_data_points}\nAccuracy (MAPE): ${result.data.accuracy?.MAPE || 'N/A'}%`);
            refetchModels();
        } catch (error) {
            setTrainingStatus('error');
            alert(`Training failed: ${error?.data?.message || 'Unknown error'}`);
        }
    };

    // Handle get forecast
    const handleGetForecast = async () => {
        if (!selectedProduct) return;

        try {
            const result = await getForecast({
                product_id: selectedProduct.product_id,
                product_option_id: selectedProduct.product_option_id,
                periods: forecastPeriods,
                frequency: frequency.value,
                include_history: true,
                force_refresh: false,
            }).unwrap();

            if (result.status === 'success' && result.data?.predictions) {
                // Format data for chart
                const chartData = result.data.predictions.map(p => ({
                    date: p.date,
                    actual: p.is_forecast ? null : p.predicted,
                    predicted: p.is_forecast ? p.predicted : null,
                    lower: p.is_forecast ? p.lower_bound : null,
                    upper: p.is_forecast ? p.upper_bound : null,
                    trend: p.trend,
                }));

                setForecastData({
                    ...result.data,
                    chartData,
                });
            }
        } catch (error) {
            alert(`Forecast failed: ${error?.data?.message || 'Unknown error'}`);
        }
    };

    // Handle delete model
    const handleDeleteModel = async () => {
        if (!selectedProduct || !confirm('Are you sure you want to delete this model?')) return;

        try {
            await deleteModel({
                product_id: selectedProduct.product_id,
                product_option_id: selectedProduct.product_option_id,
            }).unwrap();

            alert('Model deleted successfully');
            setForecastData(null);
            refetchModels();
        } catch (error) {
            alert(`Delete failed: ${error?.data?.message || 'Unknown error'}`);
        }
    };

    const modelInfo = getModelInfo();

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
                            <h3 className="font-semibold text-lg mb-1">ML Service Status</h3>
                            {healthLoading ? (
                                <p className="text-gray-500">Checking...</p>
                            ) : mlHealth?.status === 'success' ? (
                                <p className="text-green-600">✓ Service is running ({modelsData?.data?.total_models || 0} models trained)</p>
                            ) : (
                                <p className="text-red-600">✗ Service is offline</p>
                            )}
                        </div>
                        {mlHealth?.ml_service?.timestamp && (
                            <span className="text-sm text-gray-500">
                                Last check: {new Date(mlHealth.ml_service.timestamp).toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Product Selection */}
                <div className="mb-6 p-6 rounded-lg border bg-white shadow">
                    <h3 className="font-semibold text-lg mb-4">Select Product</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category (Optional)
                            </label>
                            <Select
                                options={categoryOptions}
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                                placeholder="Filter by category..."
                                isClearable
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product *
                            </label>
                            <Select
                                options={productOptions}
                                value={selectedProduct}
                                onChange={setSelectedProduct}
                                placeholder="Select a product..."
                                isSearchable
                            />
                        </div>
                    </div>

                    {selectedProduct && modelInfo && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                                <strong>Model Status:</strong> Trained on {new Date(modelInfo.trained_at).toLocaleDateString()} 
                                {modelInfo.accuracy && ` • Accuracy (MAPE): ${modelInfo.accuracy.MAPE}%`}
                                {modelInfo.data_points && ` • Data Points: ${modelInfo.data_points}`}
                            </p>
                        </div>
                    )}

                    {selectedProduct && !hasTrainedModel() && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                                ⚠️ No trained model for this product. Please train a model first.
                            </p>
                        </div>
                    )}
                </div>

                {/* Forecast Settings */}
                {selectedProduct && (
                    <div className="mb-6 p-6 rounded-lg border bg-white shadow">
                        <h3 className="font-semibold text-lg mb-4">Forecast Settings</h3>
                        
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
                                    onChange={(e) => setForecastPeriods(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>3</span>
                                    <span>24</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            {!hasTrainedModel() ? (
                                <button
                                    onClick={handleTrainModel}
                                    disabled={isTraining || !selectedProduct}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                >
                                    {isTraining ? 'Training...' : '🎓 Train Model'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleGetForecast}
                                        disabled={isForecastLoading}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                                    >
                                        {isForecastLoading ? 'Loading...' : '🔮 Get Forecast'}
                                    </button>
                                    
                                    <button
                                        onClick={handleTrainModel}
                                        disabled={isTraining}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                                    >
                                        {isTraining ? 'Retraining...' : '🔄 Retrain Model'}
                                    </button>
                                    
                                    <button
                                        onClick={handleDeleteModel}
                                        disabled={isDeleting}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
                                    >
                                        {isDeleting ? 'Deleting...' : '🗑️ Delete Model'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Forecast Results */}
                {forecastData && (
                    <div className="mb-6 p-6 rounded-lg border bg-white shadow">
                        <h3 className="font-semibold text-lg mb-4">Forecast Results</h3>
                        
                        {/* Chart */}
                        <div className="mb-6">
                            <ResponsiveContainer width="100%" height={400}>
                                <ComposedChart data={forecastData.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    
                                    {/* Confidence interval */}
                                    <Area 
                                        type="monotone" 
                                        dataKey="upper" 
                                        stroke="none" 
                                        fill="#82ca9d" 
                                        fillOpacity={0.2} 
                                        name="Upper Bound"
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="lower" 
                                        stroke="none" 
                                        fill="#82ca9d" 
                                        fillOpacity={0.2} 
                                        name="Lower Bound"
                                    />
                                    
                                    {/* Actual data */}
                                    <Line 
                                        type="monotone" 
                                        dataKey="actual" 
                                        stroke="#8884d8" 
                                        strokeWidth={2}
                                        name="Historical"
                                        dot={{ r: 4 }}
                                    />
                                    
                                    {/* Predicted data */}
                                    <Line 
                                        type="monotone" 
                                        dataKey="predicted" 
                                        stroke="#82ca9d" 
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        name="Forecast"
                                        dot={{ r: 4 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Predictions Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicted</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lower Bound</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upper Bound</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {forecastData.predictions
                                        .filter(p => p.is_forecast)
                                        .map((prediction, idx) => (
                                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-3 text-sm">{prediction.date}</td>
                                                <td className="px-4 py-3 text-sm font-semibold">{prediction.predicted.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{prediction.lower_bound.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{prediction.upper_bound.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={prediction.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {prediction.trend > 0 ? '↑' : '↓'} {Math.abs(prediction.trend).toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Model Accuracy */}
                        {forecastData.model_accuracy && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold mb-2">Model Accuracy Metrics</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">MAE:</span>
                                        <span className="ml-2 font-semibold">{forecastData.model_accuracy.MAE}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">RMSE:</span>
                                        <span className="ml-2 font-semibold">{forecastData.model_accuracy.RMSE}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">MAPE:</span>
                                        <span className="ml-2 font-semibold">{forecastData.model_accuracy.MAPE}%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {forecastData.model_accuracy.MAPE < 10 
                                        ? '✓ Excellent accuracy' 
                                        : forecastData.model_accuracy.MAPE < 15 
                                        ? '✓ Good accuracy' 
                                        : '⚠️ Consider retraining with more data'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Help Section */}
                <div className="p-6 rounded-lg border bg-blue-50 border-blue-200">
                    <h3 className="font-semibold text-lg mb-2">💡 How to Use</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                        <li>Select a product from the dropdown</li>
                        <li>If no model exists, click "Train Model" (takes 30-60 seconds)</li>
                        <li>Once trained, adjust forecast settings and click "Get Forecast"</li>
                        <li>View predictions with confidence intervals in the chart and table</li>
                        <li>Retrain periodically with new data to improve accuracy</li>
                    </ol>
                </div>
            </div>
        </>
    );
};

export default MLForecastPage;
