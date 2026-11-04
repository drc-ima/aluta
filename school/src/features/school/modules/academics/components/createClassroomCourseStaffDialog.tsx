import { useParams, useSearchParams } from "react-router-dom";
import type { CreateDialogProps } from "../../staff/components/createPositionDrawer";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { ClassroomCourseStaffPayload } from "@/types/schoolClass";
import { useClassrooms, useCreateClassroomCourseStaff } from "../hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CheckIcon, Loader2 } from "lucide-react";
import { useCourses } from "../../courses/hooks";
import { toast } from "sonner";


const formSchema = z.object({
    classroom_id: z.string().min(1, "Select a classroom for this course"),
    staff_id: z.string().min(1, "Assign a staff to this course"),
    course_id: z.string().min(1, "Select a course")
})

type ClassroomCourseStaffForm = z.infer<typeof formSchema>

export default function CreateClassroomCourseStaffDialog({
    handleOpenChange,
    refetch,
}: CreateDialogProps) {
    const [searchParams, _] = useSearchParams()
    const { id } = useParams();
    const goto = searchParams.get("return-to") || "";
    const action = searchParams.get("action") || "";

    const form = useForm<ClassroomCourseStaffForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            classroom_id: id ?? "",
            staff_id: "",
            course_id: ""
        }
    })

    const open = action === "assign-classroom-course-staff" ? true : false;

    const { selectedSchool, currentAcademicYear } = useUserDefaultsProvider();
    const { isPending, mutate } = useCreateClassroomCourseStaff(
        selectedSchool?.id!
    )
    const {
        data: classrooms
    } = useClassrooms(selectedSchool?.id!, currentAcademicYear?.id!)

    const {
        data: courses
    } = useCourses({ school_id: selectedSchool?.id! })

    const handleSubmit = (data: ClassroomCourseStaffForm | ClassroomCourseStaffPayload | any) => {
        console.log(data)
        mutate({
            ...data,
        }, {
            onSuccess: () => {
                toast.success("New course assigned successfully.")
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
                toast.error("Error assigning course")
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
            <DialogContent className="">
                <DialogHeader className='text-start'>
                    <DialogTitle className='flex items-center gap-2'>
                        Assign course to classroom
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="assign-classroom-course-staff"
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name={`classroom_id`}

                            render={({ field }) => {
                                // field.value = id;
                                return (
                                    <FormItem hidden={id === null}>
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
                                                        disabled={id !== undefined}
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
                                    <FormItem>
                                        <FormLabel>Staff</FormLabel>
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
                                                    // disabled={id !== undefined}
                                                    >
                                                        {field.value && selectedSchool !== null
                                                            ? selectedSchool.staffs.map((stf) => {
                                                                return {
                                                                    value: stf.id,
                                                                    label: `[${stf.staff_no}] ${stf.user.full_name}`
                                                                }
                                                            }).find(
                                                                (stf: any) => stf.value === field.value
                                                            )?.label
                                                            : 'Select staff.'}
                                                        <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-full! p-0'>
                                                <Command className="w-full!">
                                                    <CommandInput placeholder='Search staff...' />
                                                    <CommandEmpty>No staff found.</CommandEmpty>
                                                    <CommandGroup>
                                                        <CommandList>
                                                            {
                                                                selectedSchool && selectedSchool.staffs.map(
                                                                    staff => {
                                                                        return {
                                                                            value: staff.id,
                                                                            label: `[${staff.staff_no}] ${staff.user.full_name}`
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
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={form.control}
                            name={`course_id`}

                            render={({ field }) => {

                                return (
                                    <FormItem>
                                        <FormLabel>Course</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value!}>
                                            <FormControl className="w-full">
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select course' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="w-full">
                                                {
                                                    courses && courses.map(course => (
                                                        <SelectItem key={course.id} value={course.id}>{course.name} [{course.code}]</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                    </form>
                </Form>
                <DialogFooter className='gap-y-2 mx-auto w-full'>
                    <DialogClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button type='submit' form='assign-classroom-course-staff' disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : undefined}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}