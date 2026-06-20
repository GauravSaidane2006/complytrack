import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, setAccessToken, logout } from '../slices/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken
    if (token) headers.set('authorization', `Bearer ${token}`)
    return headers
  }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery('/auth/refresh-token', api, { ...extraOptions, _retry: true })

    if (refreshResult.data?.accessToken) {
      api.dispatch(setAccessToken(refreshResult.data.accessToken))
      if (refreshResult.data.user) {
        api.dispatch(setCredentials(refreshResult.data))
      }
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Compliance', 'ComplianceStats', 'User', 'Template',
    'Report', 'Alert', 'Dashboard', 'Risk', 'Contract', 'Organization'
  ],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials })
    }),
    register: builder.mutation({
      query: (data) => ({ url: '/auth/register', method: 'POST', body: data })
    }),
    getProfile: builder.query({
      query: () => '/auth/me',
      providesTags: ['User']
    }),
    updateProfile: builder.mutation({
      query: (data) => ({ url: '/auth/profile', method: 'PUT', body: data }),
      invalidatesTags: ['User']
    }),
    changePassword: builder.mutation({
      query: (data) => ({ url: '/auth/change-password', method: 'POST', body: data })
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' })
    }),

    getComplianceItems: builder.query({
      query: (params) => ({ url: '/compliance', params }),
      providesTags: ['Compliance']
    }),
    getComplianceItem: builder.query({
      query: (id) => `/compliance/${id}`,
      providesTags: (result, error, id) => [{ type: 'Compliance', id }]
    }),
    createComplianceItem: builder.mutation({
      query: (data) => ({ url: '/compliance', method: 'POST', body: data }),
      invalidatesTags: ['Compliance', 'ComplianceStats', 'Dashboard']
    }),
    updateComplianceItem: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/compliance/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => ['Compliance', 'ComplianceStats', 'Dashboard', { type: 'Compliance', id }]
    }),
    deleteComplianceItem: builder.mutation({
      query: (id) => ({ url: `/compliance/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Compliance', 'ComplianceStats', 'Dashboard']
    }),
    updateComplianceStatus: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/compliance/${id}/status`, method: 'PATCH', body: data }),
      invalidatesTags: (result, error, { id }) => ['Compliance', 'ComplianceStats', 'Dashboard', { type: 'Compliance', id }]
    }),
    getComplianceStats: builder.query({
      query: () => '/compliance/stats',
      providesTags: ['ComplianceStats']
    }),
    bulkCreateFromTemplate: builder.mutation({
      query: (data) => ({ url: '/compliance/bulk-from-template', method: 'POST', body: data }),
      invalidatesTags: ['Compliance', 'ComplianceStats']
    }),

    getTemplates: builder.query({
      query: (params) => ({ url: '/templates', params }),
      providesTags: ['Template']
    }),
    getTemplate: builder.query({
      query: (id) => `/templates/${id}`,
      providesTags: (result, error, id) => [{ type: 'Template', id }]
    }),
    createTemplate: builder.mutation({
      query: (data) => ({ url: '/templates', method: 'POST', body: data }),
      invalidatesTags: ['Template']
    }),
    updateTemplate: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/templates/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => ['Template', { type: 'Template', id }]
    }),
    deleteTemplate: builder.mutation({
      query: (id) => ({ url: `/templates/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Template']
    }),
    seedTemplates: builder.mutation({
      query: () => ({ url: '/templates/seed', method: 'POST' }),
      invalidatesTags: ['Template']
    }),

    getReports: builder.query({
      query: (params) => ({ url: '/reports', params }),
      providesTags: ['Report']
    }),
    getReport: builder.query({
      query: (id) => `/reports/${id}`,
      providesTags: (result, error, id) => [{ type: 'Report', id }]
    }),
    generateReport: builder.mutation({
      query: (data) => ({ url: '/reports/generate', method: 'POST', body: data }),
      invalidatesTags: ['Report']
    }),
    deleteReport: builder.mutation({
      query: (id) => ({ url: `/reports/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Report']
    }),

    getAlerts: builder.query({
      query: (params) => ({ url: '/alerts', params }),
      providesTags: ['Alert']
    }),
    getUnreadCount: builder.query({
      query: () => '/alerts/unread-count',
      providesTags: ['Alert']
    }),
    markAlertRead: builder.mutation({
      query: (id) => ({ url: `/alerts/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Alert']
    }),
    markAllAlertsRead: builder.mutation({
      query: () => ({ url: '/alerts/mark-all-read', method: 'PATCH' }),
      invalidatesTags: ['Alert']
    }),
    generateDeadlineAlerts: builder.mutation({
      query: () => ({ url: '/alerts/generate-deadline-alerts', method: 'POST' }),
      invalidatesTags: ['Alert']
    }),

    getDashboardSummary: builder.query({
      query: () => '/dashboard/summary',
      providesTags: ['Dashboard']
    }),
    getComplianceHealth: builder.query({
      query: () => '/dashboard/compliance-health',
      providesTags: ['Dashboard']
    }),
    getUpcomingDeadlines: builder.query({
      query: () => '/dashboard/upcoming-deadlines',
      providesTags: ['Dashboard']
    }),

    getRiskAssessments: builder.query({
      query: (params) => ({ url: '/risks', params }),
      providesTags: ['Risk']
    }),
    assessRisk: builder.mutation({
      query: (data) => ({ url: '/risks/assess', method: 'POST', body: data }),
      invalidatesTags: ['Risk', 'Compliance', 'ComplianceStats']
    }),
    getRiskSummary: builder.query({
      query: () => '/risks/summary',
      providesTags: ['Risk']
    }),
    updateRiskStatus: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/risks/${id}/status`, method: 'PATCH', body: data }),
      invalidatesTags: ['Risk']
    }),

    getContracts: builder.query({
      query: (params) => ({ url: '/contracts', params }),
      providesTags: ['Contract']
    }),
    getContract: builder.query({
      query: (id) => `/contracts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Contract', id }]
    }),
    createContract: builder.mutation({
      query: (data) => ({ url: '/contracts', method: 'POST', body: data }),
      invalidatesTags: ['Contract']
    }),
    updateContract: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/contracts/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => ['Contract', { type: 'Contract', id }]
    }),
    deleteContract: builder.mutation({
      query: (id) => ({ url: `/contracts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Contract']
    }),
    getContractStats: builder.query({
      query: () => '/contracts/stats',
      providesTags: ['Contract']
    }),

    getOrganization: builder.query({
      query: () => '/organization',
      providesTags: ['Organization']
    }),
    updateOrganization: builder.mutation({
      query: (data) => ({ url: '/organization', method: 'PUT', body: data }),
      invalidatesTags: ['Organization']
    }),
    refreshHealthScore: builder.mutation({
      query: () => ({ url: '/organization/refresh-health-score', method: 'POST' }),
      invalidatesTags: ['Organization', 'Dashboard']
    }),

    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['User']
    }),
    createUser: builder.mutation({
      query: (data) => ({ url: '/users', method: 'POST', body: data }),
      invalidatesTags: ['User']
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/users/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['User']
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User']
    })
  })
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useLogoutMutation,

  useGetComplianceItemsQuery,
  useGetComplianceItemQuery,
  useCreateComplianceItemMutation,
  useUpdateComplianceItemMutation,
  useDeleteComplianceItemMutation,
  useUpdateComplianceStatusMutation,
  useGetComplianceStatsQuery,
  useBulkCreateFromTemplateMutation,

  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useSeedTemplatesMutation,

  useGetReportsQuery,
  useGetReportQuery,
  useGenerateReportMutation,
  useDeleteReportMutation,

  useGetAlertsQuery,
  useGetUnreadCountQuery,
  useMarkAlertReadMutation,
  useMarkAllAlertsReadMutation,
  useGenerateDeadlineAlertsMutation,

  useGetDashboardSummaryQuery,
  useGetComplianceHealthQuery,
  useGetUpcomingDeadlinesQuery,

  useGetRiskAssessmentsQuery,
  useAssessRiskMutation,
  useGetRiskSummaryQuery,
  useUpdateRiskStatusMutation,

  useGetContractsQuery,
  useGetContractQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useDeleteContractMutation,
  useGetContractStatsQuery,

  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useRefreshHealthScoreMutation,

  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} = api
