
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
import { PlusCircle, ShieldCheck, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useOptionsStore, Option } from "@/hooks/use-options-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ListName = 'fournisseurs' | 'chassisTypes' | 'natures' | 'proprietes' | 'districts';

const OptionsManager = ({ title, listName, options, addOption, removeOption }: { title: string, listName: ListName, options: Option[], addOption: (listName: ListName, newOption: Option) => void, removeOption: (listName: ListName, value: string) => void }) => {
    const [newLabel, setNewLabel] = useState("");
    const [newAbbr, setNewAbbr] = useState("");
    const { toast } = useToast();

    const handleAdd = () => {
        if (!newLabel || !newAbbr) {
            toast({ variant: 'destructive', title: "Erreur", description: "Le nom et l'abréviation sont requis." });
            return;
        }
        const newOption = {
            value: newLabel,
            label: newLabel,
            abbreviation: newAbbr.toUpperCase(),
        };
        addOption(listName, newOption);
        setNewLabel("");
        setNewAbbr("");
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input placeholder="Nouveau nom..." value={newLabel} onChange={e => setNewLabel(e.target.value)} />
                    <Input placeholder="Abréviation..." value={newAbbr} onChange={e => setNewAbbr(e.target.value)} />
                    <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter</Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Abréviation</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {options.map(option => (
                            <TableRow key={option.value}>
                                <TableCell>{option.label}</TableCell>
                                <TableCell>{option.abbreviation}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(listName, option.value)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


export default function AdminPage() {
  const { user, users, updateUserRole, availableRoles, updateUserEmail } = useUser();
  const { fournisseurs, chassisTypes, natures, proprietes, districts, addOption, removeOption } = useOptionsStore();

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
    <div className="space-y-6">
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

        <Separator />

        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Gestion des Options</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <OptionsManager 
                    title="Fournisseurs"
                    listName="fournisseurs"
                    options={fournisseurs}
                    addOption={addOption}
                    removeOption={removeOption}
                 />
                 <OptionsManager 
                    title="Types de Châssis"
                    listName="chassisTypes"
                    options={chassisTypes}
                    addOption={addOption}
                    removeOption={removeOption}
                 />
                 <OptionsManager 
                    title="Natures Bâtiment"
                    listName="natures"
                    options={natures}
                    addOption={addOption}
                    removeOption={removeOption}
                 />
                 <OptionsManager 
                    title="Propriétés Bâtiment"
                    listName="proprietes"
                    options={proprietes}
                    addOption={addOption}
                    removeOption={removeOption}
                 />
                 <OptionsManager 
                    title="Districts STEG"
                    listName="districts"
                    options={districts}
                    addOption={addOption}
                    removeOption={removeOption}
                 />
            </div>
        </div>
    </div>
  );
}
