import axios from 'axios';

export async function getUUID(username: string) {
  const { data } = await axios.get<{ id: string; name: string }>(
    `https://api.mojang.com/users/profiles/minecraft/${username}`,
  );

  return data;
}

export async function getMultipleUUIDs(usernames: string[]) {
  if (usernames.length < 1) {
    throw new Error('No usernames provided');
  }

  if (usernames.length > 10) {
    throw new Error('Too many usernames');
  }

  const { data } = await axios.post<{ id: string; name: string }[]>(
    'https://api.mojang.com/profiles/minecraft',
    usernames,
    { headers: { 'Content-Type': 'application/json' } },
  );

  const mapped = data.map((user) => {
    return {
      id: formatMojangUUID(user.id),
      name: user.name,
    };
  });

  console.log(mapped);

  return mapped;
}

function formatMojangUUID(uuid: string) {
  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
}
