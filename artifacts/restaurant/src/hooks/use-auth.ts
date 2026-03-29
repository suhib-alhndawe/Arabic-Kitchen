import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAuthMe,
  useLogin,
  useLogout,
  getGetAuthMeQueryKey,
} from "@workspace/api-client-react";

export function useAuth() {
  return useGetAuthMe({
    query: {
      retry: false,
      staleTime: 1000 * 60 * 60, // 1 hour
    }
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  return useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
      },
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  return useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
        queryClient.clear(); // Clear all cached data on logout for security
      },
    },
  });
}
