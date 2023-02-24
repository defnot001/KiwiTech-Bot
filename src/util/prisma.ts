import { PrismaClient } from '@prisma/client';
import type { User } from 'discord.js';

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

export async function addTodo({
  title,
  type,
  createdBy,
  createdAt,
}: TodoOptions) {
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
