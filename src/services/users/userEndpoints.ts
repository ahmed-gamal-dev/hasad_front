export const userEndpoints = {
  list: '/users',
  detail: (id: number) => `/users/${id}`,
  create: '/users',
  update: (id: number) => `/users/${id}`,
  delete: (id: number) => `/users/${id}`,
};

export default userEndpoints;