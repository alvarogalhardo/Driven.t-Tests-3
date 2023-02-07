import { prisma } from '@/config';

async function checkBookingValid(userId: number) {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId,
    },
    include: {
      Ticket: true,
    },
  });
  const ticketType = await prisma.ticketType.findUnique({
    where: {
      id: enrollment.Ticket[0].ticketTypeId,
    },
  });
  return { enrollment, ticketType };
}

async function getBookingsOfRoom(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
  });
}

async function getRoomById(roomId: number) {
  return prisma.room.findUnique({
    where: {
      id: roomId,
    },
  });
}

async function postBooking(roomId: number, userId: number) {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}

const bookingsRepository = { checkBookingValid, getRoomById, getBookingsOfRoom, postBooking };

export default bookingsRepository;
