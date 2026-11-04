import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider"
import { useAcademicYears } from "@/hooks/queries";
import { Button } from "./ui/button";
import { cn } from "@/libs/utils";
import { CheckIcon, ChevronsUpDown, Loader2Icon, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdownMenu";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useUpdateDefaults } from "@/features/school/hooks";
import { toast } from "sonner";
import CreateAcademicPeriodDialog from "@/features/school/modules/academics/components/createAcademicPeriodDialog";

export function AcademicYearSwitcher() {
    const { selectedCampus, currentAcademicYear, refetchAcademicPeriods, mutateDefaults } = useUserDefaultsProvider();
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const {
        isLoading: loading,
        data: academicYears
    } = useAcademicYears(selectedCampus?.id!, selectedCampus?.school_id!)

    const updateDefaultsMutation = useUpdateDefaults();

    const fetchDefaults = async (defaults: any[] = []) => {

        updateDefaultsMutation.mutateAsync({
            defaults: defaults
        }, {
            onError: (_) => {
                toast.error("Error loading default settings")
            },
            onSuccess: async() => {
                // window.location.reload()
                await mutateDefaults({
                    defaults: []
                })
                toast.success("Default academic year updated.")
            }
        })
    }

    if (!selectedCampus) return <></>

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        role='combobox'
                        disabled={loading}
                        className={cn(
                            'justify-between',
                            // !field.value && 'text-muted-foreground'
                        )}
                    >
                        {
                            loading && (
                                <Loader2Icon className="animate-spin" />
                            )
                        }
                        {
                            !loading && (
                                currentAcademicYear ? (
                                    <span className="font-semibold">AY: {currentAcademicYear.name}</span>
                                ) : "Select Academic Year"
                            )
                        }
                        <ChevronsUpDown className='ms-auto' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='end' forceMount>
                    <DropdownMenuLabel className='text-xs text-muted-foreground'>
                        Academic Years
                    </DropdownMenuLabel>
                    {
                        academicYears && academicYears.map(ay => (
                            <DropdownMenuItem
                                key={ay.id}
                                asChild
                                onSelect={async () => {
                                    await fetchDefaults([
                                        {
                                            "entity_id": ay.id,
                                            "module_name": "AcademicYear"
                                        }
                                    ])
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{ay.name}</span>
                                    {
                                        currentAcademicYear?.id! === ay.id && <CheckIcon />
                                    }

                                </div>

                            </DropdownMenuItem>
                        ))
                    }
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='gap-2 p-2' onClick={() => {
                        searchParams.set("academic-period", "create")
                        setSearchParams(searchParams)
                    }}>
                        <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                            <Plus className='size-4' />
                        </div>
                        <div className='font-medium text-muted-foreground'>Add Academic Year</div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <CreateAcademicPeriodDialog
                handleOpenChange={(open) => {
                    if (!open) {
                        searchParams.delete("academic-period")
                        searchParams.delete("parent_id")
                        setSearchParams(searchParams)
                    }
                }}
                refetch={refetchAcademicPeriods}
                periods={academicYears || []}
            />
        </>
    )
}