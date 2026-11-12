import { z } from "zod";
import type { CreateDialogProps } from "../../staff/components/createPositionDrawer";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { useSchoolStaffs } from "../../staff/hooks";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAssignClassroomStaff, useClassrooms } from "../hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CheckIcon, Loader2, PlusIcon } from "lucide-react";
import { CommandLoading } from "cmdk";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const formSchema = z.object({
    classroom_id: z.string().min(1, "Choose a classroom"),
    staff_id: z.string().min(1, "Choose a staff"),
    head: z.boolean().optional()
})

export type ClassroomStaffForm = z.infer<typeof formSchema>;

export default function AssignClassroomStaff({
    handleOpenChange,
    refetch
}: CreateDialogProps) {
    const [searchParams, _] = useSearchParams();
    const navigate = useNavigate()
    const goto = searchParams.get("return-to") || "";
    const action = searchParams.get("action") || "";

    // classroom id
    const { id: classroom_id } = useParams();

    const form = useForm<ClassroomStaffForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            classroom_id: classroom_id ?? "",
            staff_id: "",
            head: false
        }
    })

    const open = action == "assign-classroom-staff" ? true : false;

    const { selectedCampus, currentAcademicYear } = useUserDefaultsProvider();
    const [staffSearch, setStaffSearch] = useState<string>("")
    const {
        data: staffs,
        isLoading: loadingStaff
    } = useSchoolStaffs({
        school_id: selectedCampus?.school_id!,
        params: {
            filters: [
                { id: "location", value: [selectedCampus?.id!] }
            ],
            search: staffSearch
        }
    })

    const {
        data: classrooms
    } = useClassrooms(selectedCampus?.school_id!, currentAcademicYear?.id!);

    const {
        isPending,
        mutate
    } = useAssignClassroomStaff(selectedCampus?.school_id!)

    const handleSubmit = (data: ClassroomStaffForm | any) => {
        mutate({
            ...data,
        }, {
            onSuccess: () => {
                toast.success("New student enrolled successfully.")
                form.reset()
                if (goto) {
                    window.location.href = goto
                } else {
                    refetch()
                    handleOpenChange(false)
                }
            },
            onError: (error) => {
                console.error(error)
                toast.error(JSON.parse(error.message).detail)
            }
        })
    }
    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (goto) {
                    navigate(goto)
                } else {
                    form.reset()
                    handleOpenChange(open)
                }

            }}
        >
            <DialogContent className="">
                <DialogHeader className='text-start'>
                    <DialogTitle className='flex items-center gap-2'>
                        Assign Class Teacher
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id={action}
                        className="space-y-4"
                        onSubmit={form.handleSubmit(handleSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name={`classroom_id`}

                            render={({ field }) => {
                                // field.value = id;
                                return (
                                    <FormItem hidden={classroom_id === null}>
                                        <FormLabel>Classroom</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant='outline'
                                                        role='combobox'
                                                        className={cn(
                                                            'w-full justify-between',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                        disabled={classroom_id !== undefined}
                                                    >
                                                        {field.value && classrooms
                                                            ? classrooms.map(
                                                                classroom => {
                                                                    return {
                                                                        value: classroom.id,
                                                                        label: classroom.school_class.name
                                                                    }
                                                                }
                                                            ).find(
                                                                (classroom) => classroom.value === field.value
                                                            )?.label
                                                            : 'Select classroom'}
                                                        <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-full! p-0'>
                                                <Command className="w-full!">
                                                    <CommandInput placeholder='Search classrooms...' />
                                                    <CommandEmpty>No classrooms found.</CommandEmpty>
                                                    <CommandGroup>
                                                        <CommandList>
                                                            {
                                                                classrooms && classrooms.map(
                                                                    classroom => {
                                                                        return {
                                                                            value: classroom.id,
                                                                            label: classroom.school_class.name
                                                                        }
                                                                    }
                                                                ).map((classroom) => (
                                                                    <CommandItem
                                                                        value={classroom.value}
                                                                        key={classroom.value}
                                                                        onSelect={() => {
                                                                            form.setValue('classroom_id', classroom.value)
                                                                        }}
                                                                    >
                                                                        <CheckIcon
                                                                            className={cn(
                                                                                'size-4',
                                                                                classroom.value === field.value
                                                                                    ? 'opacity-100'
                                                                                    : 'opacity-0'
                                                                            )}
                                                                        />
                                                                        {classroom.label}
                                                                    </CommandItem>
                                                                ))
                                                            }
                                                        </CommandList>
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={form.control}
                            name={`staff_id`}

                            render={({ field }) => {
                                // field.value = id;
                                return (
                                    <FormItem className="relative ">
                                        <FormLabel>Staff</FormLabel>
                                        <div className="flex gap-[0.5rem] items-center">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant='outline'
                                                            role='combobox'
                                                            className={cn(
                                                                'flex-1 justify-between',
                                                                !field.value && 'text-muted-foreground'
                                                            )}

                                                        >
                                                            {field.value && staffs
                                                                ? staffs.items.map(
                                                                    staff => {
                                                                        return {
                                                                            value: staff.id,
                                                                            label: staff.user.full_name
                                                                        }
                                                                    }
                                                                ).find(
                                                                    (staff) => staff.value === field.value
                                                                )?.label
                                                                : 'Select staff'}
                                                            <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className='p-0'>
                                                    <Command shouldFilter={false}>
                                                        <CommandInput
                                                            placeholder='Search staff...'
                                                            value={staffSearch}
                                                            onValueChange={setStaffSearch}
                                                        />
                                                        <CommandEmpty>No staff found.</CommandEmpty>
                                                        <CommandGroup>
                                                            <CommandList>
                                                                {loadingStaff && <CommandLoading>Fetching staff</CommandLoading>}
                                                                {
                                                                    staffs && staffs.items.map(
                                                                        staff => {
                                                                            return {
                                                                                value: staff.id,
                                                                                label: staff.user.full_name
                                                                            }
                                                                        }
                                                                    ).map((staff) => (
                                                                        <CommandItem
                                                                            value={staff.value}
                                                                            key={staff.value}
                                                                            onSelect={() => {
                                                                                form.setValue('staff_id', staff.value)
                                                                            }}
                                                                        >
                                                                            <CheckIcon
                                                                                className={cn(
                                                                                    'size-4',
                                                                                    staff.value === field.value
                                                                                        ? 'opacity-100'
                                                                                        : 'opacity-0'
                                                                                )}
                                                                            />
                                                                            {staff.label}
                                                                        </CommandItem>
                                                                    ))
                                                                }
                                                            </CommandList>
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>

                                        </div>

                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={form.control}
                            name="head"
                            render={({ field }) => (
                                <FormItem className='flex flex-row items-start'>
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>

                                    <FormLabel>Head Teacher</FormLabel>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter className='gap-y-2 mx-auto w-full'>
                    <DialogClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button type='submit' form={action} disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : undefined}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}