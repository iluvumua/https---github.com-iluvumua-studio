import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { CreditCard, LogOut, Settings, User, Building, Wrench, Briefcase } from "lucide-react";
import { useUser, UserRole } from "@/hooks/use-user";

const roleIcons = {
  Financier: Briefcase,
  'Moyen Bâtiment': Building,
  Technicien: Wrench,
}

export function UserNav() {
  const { user, setUser, availableRoles } = useUser();

  const handleRoleChange = (role: string) => {
    setUser({ ...user, role: role as UserRole });
  };

  const CurrentRoleIcon = roleIcons[user.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100" alt="@shadcn" data-ai-hint="user avatar" />
            <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Facturation</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Rôle Actuel</DropdownMenuLabel>
         <DropdownMenuRadioGroup value={user.role} onValueChange={handleRoleChange}>
            {availableRoles.map(role => {
              const Icon = roleIcons[role];
              return (
                <DropdownMenuRadioItem key={role} value={role}>
                    <Icon className="mr-2 h-4 w-4" />
                    {role}
                </DropdownMenuRadioItem>
              )
            })}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
