const workerEndpoints = {
  list: '/workers',
  create: '/workers',
  detail: (id: number) => `/workers/${id}`,
  update: (id: number) => `/workers/${id}`,
  delete: (id: number) => `/workers/${id}`,
  visits: (id: number) => `/workers/${id}/visits`,
};

export default workerEndpoints;
