
import type { CreateDialogProps } from "../../staff/components/createPositionDrawer";
import { useSearchParams } from "react-router-dom";
import { useSchoolClasses } from "../../classes/hooks";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useCreateBulkClassrooms } from "../hooks";
import { toast } from "sonner";

const formSchema = z.object({
    classrooms: z.array(z.object({
        school_class_id: z.string()
    }))
})

type ClassroomForm = z.infer<typeof formSchema>

export default function LoadClassroomDialog({
    handleOpenChange,
    refetch,
}: CreateDialogProps) {
    const {currentAcademicYear} = useUserDefaultsProvider()
    const form = useForm<ClassroomForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            classrooms: []
        }
    })

    const [searchParams, _] = useSearchParams()

    const goto = searchParams.get("return-to") || "";
    const action = searchParams.get("action") || "";

    const open = action == "load-create" ? true : false;
    const { selectedCampus } = useUserDefaultsProvider();

    const {
        isLoading: loadingClasses,
        data: classes
    } = useSchoolClasses(selectedCampus?.school_id!, selectedCampus?.id!)

    const {
        fields: classroomFields,
        append: appendClass,
        remove: removeClass
    } = useFieldArray({
        control: form.control,
        name: "classrooms"
    })


    const getIsAllClassesSelected = () => {
        return classroomFields.length === classes?.length
    }

    const getIsSomeClassesSelected = () => {
        return classroomFields.length > 0 && !getIsAllClassesSelected()
    }

    const toggleAllClassesSelected = () => {
        if (getIsAllClassesSelected()) {
            removeClass()
            return
        }
        removeClass()
        classes && appendClass(classes?.map(cls => { return { school_class_id: cls.id } }))

    }

    const { isPending, mutate } = useCreateBulkClassrooms(currentAcademicYear?.school_id!, currentAcademicYear?.id!)

    const handleSubmit = (data: ClassroomForm | any) => {
        mutate({
            ...data
        }, {
            onSuccess: () => {
                toast.success("Classrooms updated")
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
                toast.error("Error creating classrooms.")
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
            <DialogContent className="overflow-hidden h-[90%] flex flex-col">
                <DialogHeader className='text-start'>
                    <DialogTitle className='flex items-center gap-2'>
                        Create Classrooms for {currentAcademicYear?.name!}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="load-classrooms-form"
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4 overflow-hidden h-full! flex flex-col gap-[1rem]"
                    >
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle>
                                    <div className="flex justify-between items-center">
                                        <span>Select Classes ({classroomFields.length})</span>
                                        <Checkbox
                                            checked={
                                                getIsAllClassesSelected() ||
                                                (getIsSomeClassesSelected() && "indeterminate")
                                            }
                                            onCheckedChange={() => {
                                                toggleAllClassesSelected()
                                            }}
                                            aria-label="Select all"
                                            className="translate-y-0.5"
                                            disabled={loadingClasses}
                                        />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-hidden overflow-y-auto!">
                                {
                                    loadingClasses && (
                                        <div className="flex items-center justify-center flex-grow-1">
                                            <Loader2 className="animate-spin " />
                                        </div>
                                    )
                                }
                                
                                <div className="flex flex-col gap-[1rem]">
                                    
                                    {
                                        classes?.map((cls, indx) => (
                                            <div key={indx} className="flex justify-between items-center py-[0.4rem] border-b">
                                                <Label htmlFor={cls.id} className="flex-1">{cls.name} {cls.section}</Label>
                                                <Checkbox
                                                    id={cls.id}
                                                    checked={classroomFields.find(clsField => clsField.school_class_id === cls.id) ? true : false}
                                                    onCheckedChange={() => {
                                                        const classFieldIndex = classroomFields.findIndex(clsf => clsf.school_class_id === cls.id)
                                                        if (classFieldIndex === -1) {
                                                            appendClass({ school_class_id: cls.id })
                                                        } else {
                                                            removeClass(classFieldIndex)
                                                        }

                                                    }}
                                                />
                                            </div>
                                        ))
                                    }
                                </div>

                            </CardContent>
                        </Card>
                    </form>
                </Form>
                <DialogFooter className='gap-y-2 mx-auto w-full'>
                    <DialogClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button type='submit' form='load-classrooms-form' disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : undefined}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

