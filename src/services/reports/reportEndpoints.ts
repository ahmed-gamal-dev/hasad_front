export const reportEndpoints = {
  list: '/reports',
  pendingApproval: '/reports/pending-approval',
  detail: (id: number) => `/reports/${id}`,
  downloadPdf: (id: number) => `/reports/${id}/pdf`,
};

export default reportEndpoints;
