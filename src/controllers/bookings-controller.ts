import { AuthenticatedRequest } from '@/middlewares';
import { Response } from 'express';
import bookingsService from '@/services/bookings-service';
import httpStatus from 'http-status';
import { BookingSchema } from '@/protocols';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const booking = await bookingsService.getBooking(userId);
    return res.status(200).send(booking);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const { roomId } = req.body as BookingSchema;
  try {
    const booking = await bookingsService.postBooking(roomId, userId);
    return res.status(200).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === 'NotFoundError') return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === 'ForbiddenError') return res.sendStatus(httpStatus.FORBIDDEN);
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const { roomId } = req.body as BookingSchema;
  const { bookingId } = req.params;
  try {
    const booking = await bookingsService.updateBooking(userId, roomId, parseInt(bookingId));
    return res.status(200).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === 'ForbiddenError') return res.sendStatus(httpStatus.FORBIDDEN);
    if (error.name === 'NotFoundError') return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
