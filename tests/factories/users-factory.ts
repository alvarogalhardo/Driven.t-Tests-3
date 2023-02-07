import bcrypt from 'bcrypt';
import faker from '@faker-js/faker';
import { User } from '@prisma/client';
import { prisma } from '@/config';

export async function createUser(params: Partial<User> = {}): Promise<User> {
  const incomingPassword = params.password || faker.internet.password(6);
  const hashedPassword = await bcrypt.hash(incomingPassword, 10);

  return prisma.user.create({
    data: {
      email: params.email || faker.internet.email(),
      password: hashedPassword,
    },
  });
}

export async function createManyUsers(): Promise<User[]> {
  const incomingPassword = faker.internet.password(6);
  const hashedPassword = await bcrypt.hash(incomingPassword, 10);
  const user1 = await prisma.user.create({
    data: 
      {
        email: faker.internet.email(),
        password: hashedPassword,
      }
  });
  const user2 = await prisma.user.create({
    data: 
      {
        email: faker.internet.email(),
        password: hashedPassword,
      }
  });
  const user3 = await prisma.user.create({
    data: 
      {
        email: faker.internet.email(),
        password: hashedPassword,
      }
  });
  return [user1,user2,user3]
}
