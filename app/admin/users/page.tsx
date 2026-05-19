
// src/app/admin/users/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users } from "lucide-react";
import ClientRoleProtector from "@/components/ClientRoleProtector";

export default function AdminUsersPage() {
  return (
    <ClientRoleProtector allowedRoles={["admin"]} pageTitle="User Management">
      <AdminUsersContent />
    </ClientRoleProtector>
  );
}

function AdminUsersContent() {
  useEffect(() => {
    // Document title is now set by ClientRoleProtector
  }, []);
  
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </Button>
        <div className="flex items-center space-x-3">
          <Users className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-headline">User Management</h1>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is the User Management page. Functionality to view, edit, ban, and manage user roles and permissions will be implemented here.
          </p>
          <div className="mt-6 p-6 bg-muted/50 rounded-lg border border-dashed">
            <h3 className="font-semibold mb-2 text-lg">Coming Soon:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>User list with search and filtering</li>
              <li>User detail view</li>
              <li>Role assignment</li>
              <li>Ban/unban functionality</li>
              <li>Permission controls</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
