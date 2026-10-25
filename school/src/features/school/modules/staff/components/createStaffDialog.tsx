import { z } from "zod";
import type { CreateDialogProps } from "./createPositionDrawer";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import React from "react";
import { Loader2, PlusIcon, XIcon } from "lucide-react";
import { DatePicker } from "@/components/datePicker";
import { toast } from "sonner";
import { useCreateSchoolStaff } from "../hooks";
import type { StaffPayload } from "../api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const formSchema = z.object({
    user: z.object({
        first_name: z.string().min(1, "Enter the first name of the staff"),
        middle_name: z.string().optional(),
        last_name: z.string().min(1, "Enter the last name of the staff"),
        email: z.email({
            error: (iss) => (iss.input === '' ? 'Please enter the official email. of the staff.' : undefined),
        }),
        phone: z.string().optional(),
        role_id: z.string().optional().nullable()
    }),
    staff_info: z.object({
        staff_no: z.string().min(1, "Enter a unique staff number"),
        department_id: z.string().trim().min(1, "Select a department"),
        campus_id: z.string().trim().min(1, "Select the location of the staff"),
        parent_id: z.string().trim().optional().nullable()
    }),
    positions: z.array(z.object({
        position_id: z.string().trim().min(1, "Select job title"),
        start_date: z.date(),
        end_date: z.date().nullable()
    }))
})

type StaffForm = z.infer<typeof formSchema>

export default function CreateStaffDialog({
    handleOpenChange,
    refetch
}: CreateDialogProps) {
    const form = useForm<StaffForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user: {
                first_name: "Sheldon",
                last_name: "Cooper",
                middle_name: "Lee",
                email: "sheldon.cooper@bmi.com",
                phone: "0201234567",
                role_id: null
            },
            staff_info: {
                staff_no: "SGPA-0002",
                department_id: "",
                campus_id: "",
                parent_id: null
            },
            positions: [{
                position_id: "",
                start_date: new Date(),
                end_date: null
            }]
        }
    })
    const [searchParams, _] = useSearchParams()
    const navigate = useNavigate()
    const goto = searchParams.get("returnTo") || "";
    const action = searchParams.get("action") || "";

    const open = action == "create" ? true : false;

    const { selectedSchool } = useUserDefaultsProvider()
    const { isPending, mutate } = useCreateSchoolStaff(selectedSchool !== null ? selectedSchool?.id : "")

    const handleSubmit = (data: StaffForm | StaffPayload | any) => {
        mutate({
            ...data
        }, {
            onSuccess: () => {
                toast.success("New staff added successfully.")
                if (goto) {
                    window.location.href = goto
                } else {
                    refetch()
                    handleOpenChange(false)
                }
            },
            onError: (error) => {
                console.error(error)
                toast.error("Error creating staff")
            }
        })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                form.reset()
                handleOpenChange(open)
            }}
        >
            <DialogContent className="md:max-w-[70%]! h-[80%] overflow-hidden p-0! flex flex-col">
                <DialogHeader className='text-start'>
                    <DialogTitle className='flex items-center gap-2 p-6'>
                        Add Staff
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="staff-form"
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="py-4 flex flex-col gap-[1rem] h-svh overflow-auto p-6"
                    >
                        <div className="flex flex-col grid-1">
                            <small className="font-semibold">Personal Information</small>
                            <hr />
                        </div>
                        <div className="flex gap-[1rem]">
                            <FormField
                                control={form.control}
                                name='user.first_name'
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='text'
                                                placeholder='Enter first name'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='user.middle_name'
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Middle Name (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='text'
                                                placeholder='Enter middle name'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='user.last_name'
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='text'
                                                placeholder='Enter last name'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex gap-[1rem]">
                            <FormField
                                control={form.control}
                                name='user.email'
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Official Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='email'
                                                placeholder='Enter email address'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='user.phone'
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Phone Number (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='text'
                                                placeholder='Enter phone number'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`user.role_id`}
                                render={({ field }) => {

                                    return (
                                        <FormItem className="flex-1">
                                            <FormLabel>System Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value ? field.value : ""}>
                                                <FormControl className="w-full">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select system role' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="w-full">
                                                    {
                                                        selectedSchool !== null && selectedSchool.roles.map(role => (
                                                            <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                                        ))
                                                    }
                                                    
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                        </div>

                        <div className="flex flex-col grid-1">
                            <small className="font-semibold">Staff Information</small>
                            <hr />
                        </div>
                        <div className="flex gap-[1rem]">
                            <FormField
                                control={form.control}
                                name='staff_info.staff_no'
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Staff Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='text'
                                                placeholder='Enter staff number'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-end gap-[0.5rem] flex-1">
                                <FormField
                                    control={form.control}
                                    name='staff_info.department_id'
                                    render={({ field }) => {
                                        return (
                                            <FormItem className="flex-1">
                                                <FormLabel>Department</FormLabel>
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
                                                            >
                                                                {field.value && selectedSchool !== null
                                                                    ? selectedSchool.departments.find(
                                                                        (department: any) => department.id === field.value
                                                                    )?.name
                                                                    : 'Select department'}
                                                                <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-full p-0'>
                                                        <Command>
                                                            <CommandInput placeholder='Search department...' />
                                                            <CommandEmpty>No departments found.</CommandEmpty>
                                                            <CommandGroup>
                                                                <CommandList>
                                                                    {selectedSchool !== null && selectedSchool.departments.map((department: any) => (
                                                                        <CommandItem
                                                                            value={department.id}
                                                                            key={department.id}
                                                                            onSelect={() => {
                                                                                form.setValue('staff_info.department_id', department.id)
                                                                            }}
                                                                        >
                                                                            <CheckIcon
                                                                                className={cn(
                                                                                    'size-4',
                                                                                    department.id === field.value
                                                                                        ? 'opacity-100'
                                                                                        : 'opacity-0'
                                                                                )}
                                                                            />
                                                                            {department.name}
                                                                        </CommandItem>
                                                                    ))}
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
                                <Button
                                    type="button"
                                    variant={"outline"}
                                    onClick={() => {
                                        navigate(`/staff/departments?action=create&returnTo=/staff/all?action=create`)
                                    }}
                                    size={"sm"}
                                    title="Add a new department"
                                >
                                    <PlusIcon />
                                </Button>
                            </div>
                            <FormField
                                control={form.control}
                                name='staff_info.campus_id'
                                render={({ field }) => {
                                    return (
                                        <FormItem className="flex-1">
                                            <FormLabel>Location</FormLabel>
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
                                                        >
                                                            {field.value && selectedSchool !== null
                                                                ? selectedSchool.campuses.find(
                                                                    (campus: any) => campus.id === field.value
                                                                )?.name
                                                                : 'Select location'}
                                                            <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-full p-0'>
                                                    <Command>
                                                        <CommandInput placeholder='Search location...' />
                                                        <CommandEmpty>No location found.</CommandEmpty>
                                                        <CommandGroup>
                                                            <CommandList>
                                                                {selectedSchool !== null && selectedSchool.campuses.map((campus: any) => (
                                                                    <CommandItem
                                                                        value={campus.id}
                                                                        key={campus.id}
                                                                        onSelect={() => {
                                                                            form.setValue('staff_info.campus_id', campus.id)
                                                                        }}
                                                                    >
                                                                        <CheckIcon
                                                                            className={cn(
                                                                                'size-4',
                                                                                campus.id === field.value
                                                                                    ? 'opacity-100'
                                                                                    : 'opacity-0'
                                                                            )}
                                                                        />
                                                                        {campus.name}
                                                                    </CommandItem>
                                                                ))}
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
                        </div>
                        <FormField
                            control={form.control}
                            name='staff_info.parent_id'
                            render={({ field }) => {
                                return (
                                    <FormItem className="flex-1">
                                        <FormLabel>Line Manager</FormLabel>
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
                                                    >
                                                        {field.value && selectedSchool !== null
                                                            ? selectedSchool.staffs.map((stf: any) => {
                                                                return {
                                                                    value: stf.id,
                                                                    label: `[${stf.staff_no}] ${stf.user.first_name}${stf.user.middle_name ? stf.user.middle_name : " "}${stf.user.last_name}`
                                                                }
                                                            }).find(
                                                                (stf: any) => stf.value === field.value
                                                            )?.label
                                                            : 'Select line manager'}
                                                        <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-full p-0'>
                                                <Command>
                                                    <CommandInput placeholder='Search line manager...' />
                                                    <CommandEmpty>No staff found.</CommandEmpty>
                                                    <CommandGroup>
                                                        <CommandList>
                                                            {selectedSchool !== null && selectedSchool.staffs.map((stf: any) => {
                                                                return {
                                                                    value: stf.id,
                                                                    label: `[${stf.staff_no}] ${stf.user.first_name}${stf.user.middle_name ? stf.user.middle_name : " "}${stf.user.last_name}`
                                                                }
                                                            }).map((stf: any) => (
                                                                <CommandItem
                                                                    value={stf.value}
                                                                    key={stf.value}
                                                                    onSelect={() => {
                                                                        form.setValue('staff_info.parent_id', stf.value)
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            'size-4',
                                                                            stf.value === field.value
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
                                                                        )}
                                                                    />
                                                                    {stf.label}
                                                                </CommandItem>
                                                            ))}
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
                        <PositionFields form={form} />
                    </form>
                </Form>
                <DialogFooter className='gap-y-2 p-6 mx-auto w-full'>
                    <DialogClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button type='submit' form='staff-form' disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : undefined}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const PositionFields = ({ form }: { form: UseFormReturn<StaffForm> | any }) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "positions",
    });
    const { selectedSchool } = useUserDefaultsProvider()
    const navigate = useNavigate()

    return (
        <React.Fragment>
            <div className="flex flex-col gap-[1rem]">
                <div className="flex justify-between items-center py-2">
                    <small className="font-semibold">Staff Job titles</small>
                    <Button
                        type="button"
                        size={"sm"}
                        variant={"outline"}
                        onClick={() => append({
                            start_date: new Date(),
                            is_current: false,
                            end_date: null,
                            position_id: ""
                        })}
                    >
                        <PlusIcon />
                    </Button>
                </div>
                <hr />
                {
                    fields.map((fieldset: any, index) => {

                        return (
                            <div key={index} className="flex flex-col gap-[1rem]">
                                <div className="flex items-end gap-[1rem]">
                                    <div className="flex flex-col gap-[1rem] flex-1">
                                        <div className="flex gap-[1rem] items-end">
                                            <div className="flex items-end gap-[0.5rem] flex-1">
                                                <FormField
                                                    control={form.control}
                                                    name={`positions.${index}.position_id`}
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem className="flex-1">
                                                                <FormLabel>Job Title</FormLabel>
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
                                                                            >
                                                                                {field.value && selectedSchool !== null
                                                                                    ? selectedSchool.positions.map((pos: any) => {
                                                                                        return {
                                                                                            value: pos.id,
                                                                                            label: `${pos.name} (${pos.rank}) ${pos.employment_type}`
                                                                                        }
                                                                                    }).find(
                                                                                        (position: any) => position.value === field.value
                                                                                    )?.label
                                                                                    : 'Select job title'}
                                                                                <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                                                                            </Button>
                                                                        </FormControl>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className='w-full p-0'>
                                                                        <Command>
                                                                            <CommandInput placeholder='Search job titles...' />
                                                                            <CommandEmpty>No positions found.</CommandEmpty>
                                                                            <CommandGroup>
                                                                                <CommandList>
                                                                                    {selectedSchool !== null && selectedSchool.positions.map((pos: any) => {
                                                                                        return {
                                                                                            value: pos.id,
                                                                                            label: `${pos.name} (${pos.rank}) ${pos.employment_type}`
                                                                                        }
                                                                                    }).map((position: any) => (
                                                                                        <CommandItem
                                                                                            value={position.value}
                                                                                            key={position.value}
                                                                                            onSelect={() => {
                                                                                                form.setValue(`positions.${index}.position_id`, position.value)
                                                                                            }}
                                                                                        >
                                                                                            <CheckIcon
                                                                                                className={cn(
                                                                                                    'size-4',
                                                                                                    position.value === field.value
                                                                                                        ? 'opacity-100'
                                                                                                        : 'opacity-0'
                                                                                                )}
                                                                                            />
                                                                                            {position.label}
                                                                                        </CommandItem>
                                                                                    ))}
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
                                                <Button
                                                    type="button"
                                                    variant={"outline"}
                                                    onClick={() => {
                                                        navigate(`/staff/positions?action=create&returnTo=/staff/all?action=create`)
                                                    }}
                                                    size={"sm"}
                                                    title="Add a new position"
                                                >
                                                    <PlusIcon />
                                                </Button>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name={`positions.${index}.start_date`}
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-col flex-1'>
                                                        <FormLabel>Start Date</FormLabel>
                                                        <DatePicker selected={field.value} onSelect={field.onChange} />

                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField

                                                control={form.control}
                                                name={`positions.${index}.end_date`}
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-col flex-1'>
                                                        <FormLabel>End Date</FormLabel>
                                                        <DatePicker
                                                            disabled={fieldset.is_current}
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    {
                                        index !== 0 && (
                                            <Button
                                                size={"sm"}
                                                variant={"destructive"}
                                                type="button"
                                                onClick={() => {
                                                    if (index === 0) {
                                                        toast.error("Please add at least one job title.")
                                                        return
                                                    }
                                                    remove(index)
                                                }}
                                            >
                                                <XIcon />
                                            </Button>
                                        )
                                    }

                                </div>
                                <hr />
                            </div>
                        )
                    })
                }
            </div>
        </React.Fragment>
    )
}