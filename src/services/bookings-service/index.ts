import { notFoundError } from '@/errors';
import { forbiddenError } from '@/errors/forbidden-error';
import { BookingResponse } from '@/protocols';
import bookingsRepository from '@/repositories/booking-repository';
import { Booking } from '@prisma/client';

async function validateBooking(userId: number) {
  const valid = await bookingsRepository.checkBookingValid(userId);
  if (!valid.ticketType.includesHotel || valid.enrollment.Ticket[0].status !== 'PAID' || valid.ticketType.isRemote) {
    throw forbiddenError();
  }
}

async function validateRoom(roomId: number) {
  const bookings = await bookingsRepository.getBookingsOfRoom(roomId);
  const room = await bookingsRepository.getRoomById(roomId);
  if (!room) throw notFoundError();
  if (bookings.length >= room.capacity) {
    throw forbiddenError();
  }
}

async function postBooking(roomId: number, userId: number): Promise<Booking> {
  await validateBooking(userId);
  await validateRoom(roomId);
  return await bookingsRepository.postBooking(roomId, userId);
}

async function getBooking(userId: number): Promise<BookingResponse> {
  await validateBooking(userId);
  const booking = await bookingsRepository.getBookingsOfUser(userId);
  if (!booking) throw notFoundError();
  return booking;
}

async function updateBooking(userId: number, roomId: number, bookingId: number): Promise<Booking> {
  await validateBooking(userId);
  await validateRoom(roomId);
  const update = await bookingsRepository.updateBooking(bookingId, roomId, userId);
  if (!update) throw forbiddenError();
  return update;
}

const bookingsService = {
  postBooking,
  getBooking,
  updateBooking,
};

export default bookingsService;
