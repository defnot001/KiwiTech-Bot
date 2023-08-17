import { PrismaClient } from '@prisma/client';
import type { GuildMemberManager, Snowflake, User } from 'discord.js';
import { getMultipleUUIDs, getUUID } from './mojang';

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
      createdBy: createdBy.username,
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

export async function addMember(discordID: Snowflake, minecraftIGNs: string[], memberSince: Date, trialMember = false) {
  if (minecraftIGNs.length === 0 || minecraftIGNs.length > 10) {
    throw new Error(`Expected between 1 and 10 minecraft igns, got ${minecraftIGNs.length}.`);
  }

  if (minecraftIGNs.length === 1) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userdata = await getUUID(minecraftIGNs[0]!);

    await prisma.mCMember.create({
      data: {
        discordID,
        memberSince,
        trialMember,
        minecraftData: {
          create: {
            username: userdata.name,
            uuid: userdata.id,
          },
        },
      },
    });
  }

  if (minecraftIGNs.length > 1) {
    const userdata = await getMultipleUUIDs(minecraftIGNs);

    await prisma.mCMember.create({
      data: {
        discordID,
        memberSince,
        trialMember,
        minecraftData: {
          createMany: {
            data: userdata.map((data) => {
              return {
                username: data.name,
                uuid: data.id,
              };
            }),
          },
        },
      },
    });
  }
}

export async function updateMember(
  discordID: Snowflake,
  minecraftIGNs: string[],
  trialMember = false,
  memberSince: Date | undefined,
) {
  if (minecraftIGNs.length === 0 || minecraftIGNs.length > 10) {
    throw new Error(`Expected between 1 and 10 minecraft igns, got ${minecraftIGNs.length}.`);
  }

  if (minecraftIGNs.length === 1) {
    const userdata = await getUUID(minecraftIGNs[0]!);

    await prisma.mCMember.update({
      where: {
        discordID,
      },
      data: {
        trialMember,
        ...(memberSince && { memberSince }),
        minecraftData: {
          deleteMany: {},
          create: {
            username: userdata.name,
            uuid: userdata.id,
          },
        },
      },
    });
  }

  if (minecraftIGNs.length > 1) {
    const userdata = await getMultipleUUIDs(minecraftIGNs);

    await prisma.mCMember.update({
      where: {
        discordID,
      },
      data: {
        trialMember,
        ...(memberSince && { memberSince }),
        minecraftData: {
          deleteMany: {},
          createMany: {
            data: userdata.map((data) => {
              return {
                username: data.name,
                uuid: data.id,
              };
            }),
          },
        },
      },
    });
  }
}

export async function removeMember(discordID: Snowflake) {
  await prisma.mCMember.delete({
    where: {
      discordID,
    },
  });
}

async function getMembersFromID(members: Snowflake[], manager: GuildMemberManager) {
  const fetched = await manager.fetch({
    user: members,
  });

  return fetched;
}

export async function getMemberNames(manager: GuildMemberManager) {
  const members = await prisma.mCMember.findMany();

  const memberCollection = await getMembersFromID(
    members.map((member) => member.discordID),
    manager,
  );

  return memberCollection
    .sort((a, b) => a.user.username.localeCompare(b.user.username))
    .map((member) => member.user.username);
}

export async function getMemberFromID(id: Snowflake) {
  const member = await prisma.mCMember.findUnique({
    where: {
      discordID: id,
    },
    include: {
      minecraftData: true,
    },
  });

  if (!member) {
    throw new Error(`Member with ID ${id} not found.`);
  }

  return member;
}
