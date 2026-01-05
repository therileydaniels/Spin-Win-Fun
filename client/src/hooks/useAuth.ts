import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SafeUser } from "@shared/schema";

interface AuthResponse {
  user: SafeUser | null;
}

export function useAuth() {
  const { data, isLoading } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; confirmPassword: string; name?: string }) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  return {
    user: data?.user ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
    signup: signupMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    signupError: signupMutation.error,
    loginError: loginMutation.error,
  };
}
