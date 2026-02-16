export const reportEndpoints = {
  list: '/reports',
  create: '/reports',
  pendingApproval: '/reports/pending-approval',
  detail: (id: number) => `/reports/${id}`,
  submit: (id: number) => `/reports/${id}/submit`,
  approve: (id: number) => `/reports/${id}/approve`,
  reject: (id: number) => `/reports/${id}/reject`,
  downloadPdf: (id: number) => `/reports/${id}/pdf`,
};

export default reportEndpoints;
