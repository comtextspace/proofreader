import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createAssignment, deleteAssignment, fetchAssignments } from "@/api/users"

export function useAssignments() {
  return useQuery({
    queryKey: ["assignments"],
    queryFn: fetchAssignments,
  })
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { book: string; pages: string }) => createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] })
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] })
    },
  })
}
