import { useNavigate, useSearchParams } from "react-router-dom";
import type { CreateDialogProps } from "../../staff/components/createPositionDrawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Bio from "./createStudentSteps/bio";
import { useState } from "react";
import type { StudentPayload } from "../api";
import Guardians, { type GuardiansForm } from "./createStudentSteps/guardians";
import { useCreateStudent } from "../hooks";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { toast } from "sonner";

export default function CreateStudentDialog({
    handleOpenChange,
    refetch
}: CreateDialogProps) {
    const [searchParams, _] = useSearchParams()
    const navigate = useNavigate()
    const goto = searchParams.get("return-to") || "";
    const action = searchParams.get("action") || "";

    const open = action == "create" ? true : false;
    const [activeStep, setActiveStep] = useState("bio");
    const [data, setData] = useState<StudentPayload | any>({
        bio: {
            profile: null,
            admission_date: undefined,
            admission_number: "",
            first_name: "",
            last_name: "",
            middle_name: "",
            date_of_birth: undefined,
            gender: "",
            classroom_id: "",
            enrolled_at: undefined
        },
        guardians: [{
            guardian_id: null,
            phone: "",
            email: "",
            first_name: "",
            last_name: "",
            relationship_type: ""
        }]
    })

    const { selectedCampus } = useUserDefaultsProvider()
    const {
        isPending: loadingMutation,
        mutate
    } = useCreateStudent(selectedCampus?.school_id!, selectedCampus?.id!)

    const handleSubmit = async(finalData: any) => {

        let profile_data = null;

        if (data.bio.profile) {
            const reader = new FileReader();

            profile_data = await new Promise((resolve, reject) => {
                reader.onload = () => {
                    const base64 = reader.result?.toString().split(",")[1];

                    resolve({
                        filename: data.bio.profile.name,
                        data: base64
                    });
                };

                reader.onerror = reject;

                reader.readAsDataURL(data.bio.profile);
            });
        }
        const deta = {
            ...data,
            bio: {
                ...data.bio,
                profile: profile_data
            },
            guardians: finalData
        }

        mutate({
            ...deta
        }, {
            onSuccess: () => {
                toast.success("New student added successfully.")
                if (goto) {
                    window.location.href = goto
                } else {
                    refetch()
                    handleOpenChange(false)
                }
            },
            onError: (error) => {
                console.error(error)
                toast.error("Error creating student")
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
                    // form.reset()
                handleOpenChange(open)
                }
                
            }}
        >
            <DialogContent className="md:max-w-[70%]! max-h-[80%] overflow-hidden! p-0! flex flex-col">
                <DialogHeader className='text-start'>
                    <DialogTitle className='flex items-center gap-2 p-6'>
                        Student Admission
                    </DialogTitle>
                </DialogHeader>
                {
                    activeStep === "bio" ? (
                        <Bio
                            data={data}
                            onContinue={(bioData) => {
                                console.log(bioData)
                                setData({
                                    ...data,
                                    bio: bioData
                                })

                                setActiveStep("gardians")
                            }}
                        />
                    ) : (
                        <Guardians
                            data={data}
                            onContinue={(guardianData) => {

                                handleSubmit(guardianData)
                            }}
                            setActiveStep={setActiveStep}
                            loading={loadingMutation}
                        />
                    )
                }

            </DialogContent>
        </Dialog>
    )
}