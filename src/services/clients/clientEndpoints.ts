export const clientEndpoints = {
  list: '/clients',
  exportCsv: '/clients/export/csv',
  create: '/clients',
  detail: (id: number) => `/clients/${id}`,
  update: (id: number) => `/clients/${id}`,
  delete: (id: number) => `/clients/${id}`,
};

export default clientEndpoints;
