const userEndpoints = {
  list: '/users',
  create: '/users',
  detail: (id: number) => `/users/${id}`,
  update: (id: number) => `/users/${id}`,
  delete: (id: number) => `/users/${id}`,
  exportCsv: '/users/export/csv',
};

export default userEndpoints;