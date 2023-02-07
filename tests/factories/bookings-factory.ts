import { prisma } from '@/config';

export async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export async function createManyBookings(
  roomId: number,
  firstUserId: number,
  secondUserId: number,
  thirdUserId: number,
) {
  return prisma.booking.createMany({
    data: [
      {
        userId: firstUserId,
        roomId,
      },
      {
        userId: secondUserId,
        roomId,
      },
      {
        userId: thirdUserId,
        roomId,
      },
    ],
  });
}
