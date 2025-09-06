
"use client";

import { useUser, User, UserRole } from "@/hooks/use-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const { user, users, updateUserRole, availableRoles, updateUserEmail } = useUser();

  if (user.role !== 'Admin') {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Accès non autorisé</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Vous devez être un administrateur pour voir cette page.</p>
            </CardContent>
        </Card>
    )
  }

  const handleRoleChange = (userId: number, role: UserRole) => {
    updateUserRole(userId, role);
  };

  const handleEmailChange = (userId: number, email: string) => {
    updateUserEmail(userId, email);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Utilisateurs</CardTitle>
        <CardDescription>
          Gérer les utilisateurs et leurs rôles dans l'application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>
                  <Input 
                    defaultValue={u.email}
                    onBlur={(e) => handleEmailChange(u.id, e.target.value)}
                    disabled={u.id === user.id}
                  />
                </TableCell>
                <TableCell>
                   <Select 
                     value={u.role} 
                     onValueChange={(value) => handleRoleChange(u.id, value as UserRole)}
                     disabled={u.id === user.id} // Prevent admin from changing their own role
                   >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
