import { getBooking, postBooking, updateBooking } from '@/controllers/bookings-controller';
import { authenticateToken, validateBody } from '@/middlewares';
import bookingSchema from '@/schemas/bookings-schema';
import { Router } from 'express';

const bookingsRouter = Router();

bookingsRouter
    .all("/*", authenticateToken)
    .get("/", getBooking)
    .post("/", validateBody(bookingSchema), postBooking)
    .put("/:bookingId",validateBody(bookingSchema),updateBooking)

export default bookingsRouter;
