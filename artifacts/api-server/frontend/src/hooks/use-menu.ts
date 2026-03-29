import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  getGetMenuItemsQueryKey,
  type GetMenuItemsParams,
} from "@workspace/api-client-react";

export function useMenu(params?: GetMenuItemsParams) {
  return useGetMenuItems(params, {
    query: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  return useCreateMenuItem({
    mutation: {
      onSuccess: () => {
        // Invalidate all menu queries (list and filtered lists)
        queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      },
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();
  return useUpdateMenuItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      },
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();
  return useDeleteMenuItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      },
    },
  });
}
