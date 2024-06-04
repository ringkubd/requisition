import * as Yup from "yup";
import { ObjectSchema } from "yup";

const validationSchema: ObjectSchema<any> = Yup.object().shape({
    product_id: Yup.number().required().label('Product'),
    product_option_id: Yup.number().required().label('Variant'),
    required_quantity: Yup.number().required().label('Required Quantity'),
    available_quantity: Yup.number().required().label('Available Quantity'),
    quantity_to_be_purchase: Yup.number()
        .required()
        .label('Quantity to be purchase'),
    purpose: Yup.string().required().label('Purpose'),
})

export default validationSchema;
