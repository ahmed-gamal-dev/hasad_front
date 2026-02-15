export const visitEndpoints = {
  list: '/visits',
  create: '/visits',
  calendar: '/visits/calendar',
  complete: (id: number) => `/visits/${id}/complete`,
};

export default visitEndpoints;
