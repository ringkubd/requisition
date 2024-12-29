import { FormikValues } from "formik";
import axios from '@/lib/axios'

const addItem = (
    values: FormikValues,
    products: any[],
    callBack: (values: FormikValues) => void,
) => {
    values.estimated_cost =
        parseFloat(
            products
                .filter(p => p.id == values.product_id)[0]
                ?.product_options.filter(
                o => o.id == values.product_option_id,
            )[0].unit_price,
        ) * parseFloat(values.quantity_to_be_purchase)
    return callBack(values)
}


async function loadCategory(search: string, loadedOptions: any, { page }: any) {
    const response = await axios.get(`/api/category-select`, {
        params: {
            search: search,
            page: page,
        },
    })
    const responseJSON = response.data
    return {
        options: responseJSON.data?.categories?.map(r => {
            return {
                label: r.title,
                value: r.id,
            }
        }),
        hasMore: responseJSON.data.count > 20,
        additional: {
            page: search ? 1 : page + 1,
        },
    }
}

async function loadProducts(search: String, loadedOptions: any, { page }: any, selectedCategory?: String) {
    const response = await axios.get(`/api/product-select`, {
        params: {
            search: search,
            page: page,
            category_id: selectedCategory,
        },
    })
    const responseJSON = response.data

    return {
        options: responseJSON.data?.products?.map(r => {
            return {
                label: r.title,
                value: r.id,
                product_options: r.product_options,
                unit: r.unit,
            }
        }),
        hasMore: responseJSON.data.count > 20,
        additional: {
            page: search ? 1 : page + 1,
        },
    }
}

export {
    addItem,
    loadCategory
}
