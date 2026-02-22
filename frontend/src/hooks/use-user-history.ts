import { useQuery } from "@tanstack/react-query"
import { fetchUserHistory } from "@/api/users"

export function useUserHistory(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["user-history", params],
    queryFn: () => fetchUserHistory(params),
  })
}
