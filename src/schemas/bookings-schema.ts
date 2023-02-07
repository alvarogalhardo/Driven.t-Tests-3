import Joi from "joi";
import { BookingSchema } from "@/protocols";

const bookingSchema = Joi.object<BookingSchema>({
    roomId: Joi.number().required
})

export default bookingSchema;