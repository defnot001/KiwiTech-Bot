import { PrismaClient } from '@prisma/client';
import type { GuildMemberManager, Snowflake, User } from 'discord.js';

const prisma = new PrismaClient();

type TodoOptions = {
  title: string;
  type: 'survival' | 'creative';
  createdBy: User;
  createdAt?: Date;
};

export async function getAllTodos() {
  return await prisma.todo.findMany();
}

export async function getTodoByType(type: 'survival' | 'creative') {
  return await prisma.todo.findMany({
    where: {
      type,
    },
  });
}

export async function addTodo({ title, type, createdBy, createdAt }: TodoOptions) {
  await prisma.todo.create({
    data: {
      title,
      type,
      createdBy: createdBy.tag,
      createdAt: createdAt,
    },
  });
}

export async function updateTodo(oldTitle: string, newTitle: string) {
  await prisma.todo.updateMany({
    where: {
      title: oldTitle,
    },
    data: {
      title: newTitle,
    },
  });
}

export async function completeTodo(title: string) {
  await prisma.todo.deleteMany({
    where: {
      title,
    },
  });
}

export async function addMember(user: User, minecraftIDs: string[]) {
  await prisma.member.create({
    data: {
      discordID: user.id,
      minecraftIDs: minecraftIDs,
    },
  });
}

async function getMembersFromID(members: Snowflake[], manager: GuildMemberManager) {
  return await manager.fetch({
    user: members,
  });
}

export async function getMemberNames(manager: GuildMemberManager) {
  const members = await prisma.member.findMany();

  const memberCollection = await getMembersFromID(
    members.map((member) => member.discordID),
    manager,
  );

  return memberCollection
    .sort((a, b) => a.user.username.localeCompare(b.user.username))
    .map((member) => member.user.username);
}
