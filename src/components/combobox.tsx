
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"

interface ComboboxProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Combobox({ options, value, onChange, placeholder, className, disabled }: ComboboxProps) {
  const { user } = useUser();
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const isAdmin = user.role === 'Admin';

  const handleSelect = (currentValue: string) => {
    onChange(currentValue === value ? "" : currentValue)
    setOpen(false)
  }

  const handleCreate = () => {
    if (isAdmin && inputValue) {
      onChange(inputValue)
      setOpen(false)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
        handleCreate();
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", !value && "text-muted-foreground", className)}
          disabled={disabled}
        >
          {value
            ? options.find((option) => option.value.toLowerCase() === value.toLowerCase())?.label ?? value
            : placeholder || "Select option..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command onKeyDown={handleKeyDown} filter={(value, search) => {
            const option = options.find(option => option.value === value);
            const label = option ? option.label : '';
            if (value.toLowerCase().includes(search.toLowerCase()) || label.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}>
          <CommandInput 
            placeholder={isAdmin ? "Rechercher ou créer..." : "Rechercher..."}
            value={inputValue}
            onValueChange={setInputValue}
           />
          <CommandList>
            <CommandEmpty>
                {isAdmin && inputValue ? (
                    <div 
                        className="p-2 text-sm cursor-pointer hover:bg-accent"
                        onClick={handleCreate}
                    >
                        Ajouter: "{inputValue}"
                    </div>
                ) : "Aucun résultat."}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
