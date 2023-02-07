import { notFoundError } from '@/errors';
import { forbiddenError } from '@/errors/forbidden-error';
import bookingsRepository from '@/repositories/booking-repository';

async function validateBooking(userId: number) {
  const valid = await bookingsRepository.checkBookingValid(userId);
  if (!valid.ticketType.includesHotel || valid.enrollment.Ticket[0].status !== 'PAID' || valid.ticketType.isRemote) {
    throw forbiddenError()
  }
}

async function postBooking(roomId:number,userId:number){
    await validateBooking(userId)
    const bookings = await bookingsRepository.getBookingsOfRoom(roomId)
    const room = await bookingsRepository.getRoomById(roomId)
    if(!room) throw notFoundError()
    if(bookings.length >= room.capacity){
        throw forbiddenError()
    }
    return await bookingsRepository.postBooking(roomId,userId)
}

const bookingsService = {
  validateBooking,
  postBooking
};

export default bookingsService;
