import { z } from "zod";
import type { CreateDialogProps } from "../../staff/components/createPositionDrawer";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { useClassrooms, useEnrollStudent } from "../hooks";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/libs/utils";
import { CheckIcon, Loader2, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useSchoolStudents } from "../../students/hooks";
import { useState } from "react";
import { CommandLoading } from "cmdk";
import { DatePicker } from "@/components/datePicker";
import type { EnrollStudentPayload } from "@/types/student";
import { toast } from "sonner";

const formSchema = z.object({
    classroom_id: z.string().min(1, "Choose a classroom"),
    student_id: z.string().min(1, "Choose a student"),
    enrolled_at: z.date()
})

export type EnrollStudentForm = z.infer<typeof formSchema>

export default function EnrollStudentDialog({
    handleOpenChange,
    refetch
}: CreateDialogProps) {

    const [searchParams, _] = useSearchParams();
    const navigate = useNavigate()
    const goto = searchParams.get("return-to") || "";
    const action = searchParams.get("action") || "";

    // classroom id
    const { id: classroom_id } = useParams();

    const form = useForm<EnrollStudentForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            classroom_id: classroom_id ?? "",
            student_id: "",
        }
    })

    const open = action == "enroll-student" ? true : false;

    const { selectedCampus, currentAcademicYear } = useUserDefaultsProvider();
    const {
        data: classrooms
    } = useClassrooms(selectedCampus?.school_id!, currentAcademicYear?.id!)

    const {
        isPending,
        mutate
    } = useEnrollStudent(selectedCampus?.school_id!)

    const [studentSearch, setStudentSearch] = useState<string>("")
    const {
        data: students,
        isLoading: loadingStudents
    } = useSchoolStudents(
        selectedCampus?.school_id!,
        {
            filters: [
                { id: "campus_id", value: [selectedCampus?.id!] }
            ],
            search: studentSearch
        })

    const handleSubmit = (data: EnrollStudentForm | EnrollStudentPayload | any) => {
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
                        Enroll New Student
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
                            name={`student_id`}

                            render={({ field }) => {
                                // field.value = id;
                                return (
                                    <FormItem className="relative ">
                                        <FormLabel>Student</FormLabel>
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
                                                            {field.value && students
                                                                ? students.items.map(
                                                                    classroom => {
                                                                        return {
                                                                            value: classroom.id,
                                                                            label: classroom.full_name
                                                                        }
                                                                    }
                                                                ).find(
                                                                    (classroom) => classroom.value === field.value
                                                                )?.label
                                                                : 'Select student'}
                                                            <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className='p-0'>
                                                    <Command shouldFilter={false}>
                                                        <CommandInput
                                                            placeholder='Search student...'
                                                            value={studentSearch}
                                                            onValueChange={setStudentSearch}
                                                        />
                                                        <CommandEmpty>No students found.</CommandEmpty>
                                                        <CommandGroup>
                                                            <CommandList>
                                                                {loadingStudents && <CommandLoading>Fetching students</CommandLoading>}
                                                                {
                                                                    students && students.items.map(
                                                                        student => {
                                                                            return {
                                                                                value: student.id,
                                                                                label: student.full_name
                                                                            }
                                                                        }
                                                                    ).map((student) => (
                                                                        <CommandItem
                                                                            value={student.value}
                                                                            key={student.value}
                                                                            onSelect={() => {
                                                                                form.setValue('student_id', student.value)
                                                                            }}
                                                                        >
                                                                            <CheckIcon
                                                                                className={cn(
                                                                                    'size-4',
                                                                                    student.value === field.value
                                                                                        ? 'opacity-100'
                                                                                        : 'opacity-0'
                                                                                )}
                                                                            />
                                                                            {student.label}
                                                                        </CommandItem>
                                                                    ))
                                                                }
                                                            </CommandList>
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <Button
                                                size={"icon"}
                                                className="rounded-full!"
                                                type="button"
                                                variant={"secondary"}
                                                onClick={() => {
                                                    navigate(`/students/students?action=create&return-to=/academics/classrooms/${classroom_id}?action=${action}&tab=students`)
                                                }}
                                            >
                                                <PlusIcon />
                                            </Button>
                                        </div>

                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={form.control}
                            name={`enrolled_at`}
                            render={({ field }) => (
                                <FormItem className='flex flex-col flex-1'>
                                    <FormLabel>Enrolled Date</FormLabel>
                                    <DatePicker
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        maxDate={new Date()}
                                    />

                                    <FormMessage />
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