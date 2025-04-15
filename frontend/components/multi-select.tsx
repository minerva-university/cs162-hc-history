"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MultiSelectProps {
  options: { label: string; value: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  maxDisplayItems?: number
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  maxDisplayItems = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  // Toggle selection of an item
  const toggleSelection = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  // Select all options
  const selectAll = () => {
    onChange(options.map(option => option.value))
  }

  // Clear all selected options
  const clearAll = () => {
    onChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          className="w-full justify-between h-auto min-h-10 py-2"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : selected.length <= maxDisplayItems ? (
              selected.map(value => {
                const option = options.find(o => o.value === value)
                return (
                  <Badge key={value} variant="secondary" className="mr-1">
                    {option?.label || value}
                  </Badge>
                )
              })
            ) : (
              <>
                <Badge variant="secondary" className="mr-1">
                  {selected.length} selected
                </Badge>
              </>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <ScrollArea className="h-72">
              <CommandGroup>
                <CommandItem 
                  onSelect={selectAll} 
                  className="cursor-pointer"
                >
                  <div className="mr-2 flex items-center justify-center">
                    <Check 
                      className={cn(
                        "h-4 w-4",
                        selected.length === options.length ? "opacity-100" : "opacity-0"
                      )} 
                    />
                  </div>
                  <span>Select All</span>
                </CommandItem>
                {options.map(option => (
                  <CommandItem 
                    key={option.value} 
                    onSelect={() => toggleSelection(option.value)}
                    className="cursor-pointer"
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected.includes(option.value) 
                        ? "bg-primary text-primary-foreground" 
                        : "opacity-50 [&_svg]:invisible"
                    )}>
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
            {selected.length > 0 && (
              <CommandGroup>
                <CommandItem 
                  onSelect={clearAll}
                  className="justify-center cursor-pointer"
                >
                  Clear All
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 