import app, { init } from '@/app';
import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
  createEnrollmentWithAddress,
  createHotel,
  createManyUsers,
  createPayment,
  createRoomWithHotelId,
  createTicket,
  createTicketTypeWithHotel,
  createUser,
} from '../factories';
import { createBooking, createManyBookings } from '../factories/bookings-factory';
import { cleanDb, generateValidToken } from '../helpers';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status code 404 when user has no reservation', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      await createHotel();

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status code 200 and return the reservation', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, room.id);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toBe(httpStatus.OK);
      expect(response.body).toEqual(expect.objectContaining({
        id: expect.any(Number),
        Room: expect.objectContaining({
          capacity: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          hotelId: expect.any(Number),
          id: expect.any(Number),
          name: expect.any(String)
        })
      }));
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it("should respond with status code 404 if room ID doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      await createHotel();
      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: faker.datatype.number() });
      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('should respond with status code 403 if room is full', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const fakeUsers = await createManyUsers();
      await createManyBookings(room.id, fakeUsers[0].id, fakeUsers[1].id, fakeUsers[2].id);
      const response =
        await
          server
            .post('/booking')
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: room.id });
      expect(response.statusCode).toBe(httpStatus.FORBIDDEN);
    });
    it('should respond with status code 200 and return the bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const response =
        await
          server
            .post('/booking')
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: room.id });
      expect(response.statusCode).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          bookingId: expect.any(Number),
        }),
      );
    });
  });
});

describe('PUT /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put(`/booking/${faker.datatype.number()}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put(`/booking/${faker.datatype.number()}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put(`/booking/${faker.datatype.number()}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('when token is valid', () => {
    it("should respond with status code 404 if room ID doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      await createHotel();
      const response = await server
        .put(`/booking/${faker.datatype.number()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: faker.datatype.number() });
      expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
    });
    it('should respond with status code 403 if room is full', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const room2 = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, room2.id);
      const fakeUsers = await createManyUsers();
      await createManyBookings(room.id, fakeUsers[0].id, fakeUsers[1].id, fakeUsers[2].id);
      const response =
        await
          server
            .put(`/booking/${room2.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: room.id });
      expect(response.statusCode).toBe(httpStatus.FORBIDDEN);
    });
    it('should respond with status code 200 and return the bookingId', async () => {
      const user = await createUser();
      const ticketType = await createTicketTypeWithHotel();
      const hotel = await createHotel();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const room = await createRoomWithHotelId(hotel.id);
      const room2 = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const response =
        await
          server
            .put(`/booking/${booking.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: room2.id });
      expect(response.statusCode).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          bookingId: expect.any(Number),
        }),
      );
    });
  });
});
