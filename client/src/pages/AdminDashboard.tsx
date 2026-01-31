import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Footer } from "@/components/Footer";
import {
  ArrowLeft,
  Users,
  CircleDot,
  Calendar,
  CalendarDays,
  Trash2,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  usersByRole: { free: number; paid: number; admin: number };
  totalWheels: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

interface UserWithWheelCount {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  wheelsCount: number;
}

interface PaginatedUsers {
  users: UserWithWheelCount[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteUser, setDeleteUser] = useState<UserWithWheelCount | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const usersQueryKey = search 
    ? `/api/admin/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`
    : `/api/admin/users?page=${page}&limit=10`;
  
  const { data: usersData, isLoading: usersLoading } = useQuery<PaginatedUsers>({
    queryKey: [usersQueryKey],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const roleChangeMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        String(query.queryKey[0]).startsWith("/api/admin/users")
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Role updated", description: "User role has been changed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update role.", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        String(query.queryKey[0]).startsWith("/api/admin/users")
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User deleted", description: "User and their wheels have been deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    },
  });

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRoleChange = (userId: number, newRole: string) => {
    roleChangeMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteConfirm = () => {
    if (deleteUser) {
      deleteUserMutation.mutate(deleteUser.id);
      setDeleteUser(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="gap-2"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <ThemeToggle />
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                You don't have permission to access this page.
              </p>
              <Button onClick={() => setLocation("/")} data-testid="button-go-home">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.1) 0%, transparent 40%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="gap-2"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #A855F7, #EC4899, #0EA5E9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Admin Dashboard
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 p-4 sm:p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats Cards */}
          {statsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border bg-card/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-users">
                      {stats.totalUsers}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Wheels
                    </CardTitle>
                    <CircleDot className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-wheels">
                      {stats.totalWheels}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      This Week
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-users-week">
                      +{stats.newUsersThisWeek}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      This Month
                    </CardTitle>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-users-month">
                      +{stats.newUsersThisMonth}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border bg-card/80 backdrop-blur-sm">
                <CardContent className="py-3">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Users by role:</span>
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-md" data-testid="text-free-count">
                      {stats.usersByRole.free} free
                    </span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md" data-testid="text-paid-count">
                      {stats.usersByRole.paid} paid
                    </span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md" data-testid="text-admin-count">
                      {stats.usersByRole.admin} admin
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}

          {/* Users Table */}
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Users</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pl-9"
                      data-testid="input-search-users"
                    />
                  </div>
                  <Button size="sm" onClick={handleSearch} data-testid="button-search">
                    Search
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : usersData && usersData.users.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">
                            Name
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Role</th>
                          <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">
                            Wheels
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden lg:table-cell">
                            Joined
                          </th>
                          <th className="text-right py-3 px-2 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersData.users.map((u) => (
                          <tr
                            key={u.id}
                            className="border-b border-border/50 hover:bg-muted/50"
                            data-testid={`row-user-${u.id}`}
                          >
                            <td className="py-3 px-2 truncate max-w-[200px]" data-testid={`text-email-${u.id}`}>
                              {u.email}
                            </td>
                            <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">
                              {u.name || "-"}
                            </td>
                            <td className="py-3 px-2">
                              <Select
                                value={u.role}
                                onValueChange={(value) => handleRoleChange(u.id, value)}
                                disabled={u.id === user?.id}
                              >
                                <SelectTrigger
                                  className="w-24 h-8"
                                  data-testid={`select-role-${u.id}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">free</SelectItem>
                                  <SelectItem value="paid">paid</SelectItem>
                                  <SelectItem value="admin">admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-2 text-center hidden md:table-cell">
                              {u.wheelsCount}
                            </td>
                            <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteUser(u)}
                                disabled={u.id === user?.id}
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-delete-user-${u.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {usersData.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="gap-1"
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </Button>
                      <span className="text-sm text-muted-foreground" data-testid="text-page-info">
                        Page {usersData.page} of {usersData.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(usersData.totalPages, p + 1))}
                        disabled={page === usersData.totalPages}
                        className="gap-1"
                        data-testid="button-next-page"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {search ? "No users found matching your search." : "No users yet."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteUser !== null} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete user <strong>{deleteUser?.email}</strong>? This will also delete all their
              saved wheels. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
