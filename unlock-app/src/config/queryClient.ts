import { QueryClient, QueryCache } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import * as Sentry from '@sentry/nextjs'
import { ToastHelper } from '@unlock-protocol/ui'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      const id = Sentry.captureException(error, {
        contexts: {
          query: {
            queryKey: query.queryKey,
          },
        },
      })

      console.debug(`Event ID: ${id}\n`, error)

      if (query?.meta?.errorMessage) {
        ToastHelper.error(query.meta.errorMessage as string)
      } else {
        switch (error?.code) {
          case -32000:
          case 4001:
          case 'ACTION_REJECTED':
            ToastHelper.error('Transaction rejected')
            break
          default: {
            const errorMessage = error?.error?.message || error.message
            console.error(errorMessage)
          }
        }
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute!
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      retry: (failureCount, error) => {
        if (failureCount > 3) {
          return false
        }
        if (error instanceof AxiosError) {
          return ![400, 401, 403, 404].includes(error.response?.status || 0)
        }
        return true
      },
    },
  },
})
