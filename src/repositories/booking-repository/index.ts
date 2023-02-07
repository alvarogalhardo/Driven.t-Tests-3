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

async function getBookingsOfUser(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      Room: true,
      id: true,
    },
  });
}

async function updateBooking(bookingId: number,roomId:number,userId:number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
        roomId,
        userId
    },
  });
}

const bookingsRepository = {
  checkBookingValid,
  getRoomById,
  getBookingsOfRoom,
  postBooking,
  getBookingsOfUser,
  updateBooking,
};

export default bookingsRepository;
