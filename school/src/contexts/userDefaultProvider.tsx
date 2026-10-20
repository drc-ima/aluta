import type { DefaultModulePayload } from "@/api/api"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { SchoolCampusProps } from "@/features/school/api"
import { useUpdateDefaults, useUserSchools, useUserSchoolsCampuses } from "@/features/school/hooks"
import { useUserDefaults } from "@/hooks/queries"
import { ArrowRightIcon, Loader2Icon, LoaderIcon } from "lucide-react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "./authProvider"

export type DefaultsProps = {
    [key: string]: string
}

type UserDefaultsProviderState = {
    defaults: DefaultsProps | null | undefined,
    loadingSchools: boolean,
    loadingSettings: boolean,
    schoolsCampuses: SchoolCampusProps[] | undefined,
    selectedCampus: any | null,
    selectedSchool: any | null
}
const UserDefaultsContext = createContext<UserDefaultsProviderState | undefined>(undefined);


type UserDefaultsProviderProps = {
    children: React.ReactNode
}
export function UserDefaultsProvider({
    children
}: UserDefaultsProviderProps) {
    const { user } = useAuth()
    const schools = useUserSchools({ enabled: user !== null })

    const schoolsCampuses = useUserSchoolsCampuses({ enabled: user !== null })

    // const settings = async () => {

    //     if (defaultModules.data !== null) {
    //         setDefaults(defaultModules.data)
    //     } else {
    //         // create defaults with school_id and campus id
    //         if (schoolsCampuses.data?.length === 0) {
    //             const school_id = schoolsCampuses.data?.[0].school_id;
    //             const campus_id = schoolsCampuses.data?.[0].campus_id;
    //             await updateDefaults(school_id, "School")
    //             await updateDefaults(campus_id, "Campus")
    //         }

    //     }
    // }

    useEffect(() => {
        if (!schoolsCampuses.data) return;
        fetchDefaults()
    }, [schoolsCampuses.data])

    const {
        isPending: loadingSettings,
        data: defaults,
        mutate: mutateDefaults
    } = useUpdateDefaults()

    const selectedSchool = useMemo(() => {
        if (loadingSettings) return null;

        return schools?.data?.find(
            school => school.id === defaults?.["School"]
        ) || null;
    }, [defaults?.School, loadingSettings, schools.data]);

    const selectedCampus = useMemo(() => {
        if (!selectedSchool) return null;

        return selectedSchool.campuses.find(
            (campus: any) => campus.id === defaults?.["Campus"]
        ) || null;
    }, [selectedSchool, defaults?.Campus]);

    const fetchDefaults = async (defaultAsArg: DefaultModulePayload[] = []) => {
        let defaults: DefaultModulePayload[] = []
        if (defaultAsArg && defaultAsArg.length > 0) {
            defaults = defaultAsArg
        } else {
            if (schoolsCampuses.data?.length === 1) {
                // for (const sc in schoolsCampuses.data) {
                //     defaults.push(
                //         {
                //             entity_id: schoolsCampuses.data[parseInt(sc)].school_id,
                //             module_name: "School"
                //         }
                //     );

                //     defaults.push(
                //         {
                //             entity_id: schoolsCampuses.data[parseInt(sc)].campus_id,
                //             module_name: "Campus"
                //         }
                //     )
                // }
            }
        }

        mutateDefaults({
            defaults: defaults
        }, {
            onError: (_) => {
                toast.error("Error loading default settins")
            }
        })
    }

    return (
        <UserDefaultsContext.Provider
            value={{
                defaults,
                loadingSchools: schools.isLoading,
                loadingSettings,
                schoolsCampuses: schoolsCampuses.data,
                selectedSchool,
                selectedCampus
            }}
        >
            {
                user ? (
                    schoolsCampuses.isLoading && !selectedSchool && !selectedCampus ?
                        (
                            <div className=" flex h-svh w-full overflow-hidden">
                                <div className="flex-grow-1 flex justify-center items-center">
                                    <LoaderIcon className="animate-spin w-[3rem] h-[3rem]" />
                                </div>
                            </div>
                        )
                        : (
                            defaults !== undefined && Object.keys(defaults).length === 0 ? <CampusSelector campuses={schoolsCampuses.data} /> : children
                        )
                ) : children

            }

        </UserDefaultsContext.Provider>
    )
}

export const useUserDefaultsProvider = () => {
    const context = useContext(UserDefaultsContext)
    if (!context) throw new Error("useUserDefaults must be used within a UserDefaultsProvider")
    return context;
}


const CampusSelector: React.FC<{
    campuses: SchoolCampusProps[] | undefined;

}> = ({ campuses }) => {

    const updateDefaultsMutation = useUpdateDefaults();

    const fetchDefaults = async (defaults = []) => {

        updateDefaultsMutation.mutateAsync({
            defaults: defaults
        }, {
            onError: (_) => {
                toast.error("Error loading default settins")
            },
            onSuccess: () => {
                window.location.replace("/dashboard")
            }
        })
    }
    return (
        <Layout>
            <div className=" container overflow-hidden h-full flex flex-col justify-center">
                <div className="flex flex-col gap-[1rem]">
                    <h1 className="font-semibold">Select your school</h1>
                    {
                        campuses?.map(campus => (
                            <div key={campus.campus_id} className="rounded-xl shadow-xs text-sm flex flex-col py-[24px] ring-1 ring-foreground/10">
                                <div className="px-[24px]">
                                    <div>
                                        <div className="flex items-center justify-between gap-4 max-sm:flex-wrap">
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-1xl">{campus.school_name}</span> - <span className="text-1xl">{campus.campus_name}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={async () => {
                                                    const defaults: any = [
                                                        {
                                                            entity_id: campus.school_id,
                                                            module_name: "School",
                                                        },
                                                        {
                                                            entity_id: campus.campus_id,
                                                            module_name: "Campus",
                                                        }
                                                    ]

                                                    await fetchDefaults(defaults)
                                                }}
                                                disabled={updateDefaultsMutation.isPending} variant={"secondary"}>
                                                {updateDefaultsMutation.isPending ? <Loader2Icon className='animate-spin' /> : <ArrowRightIcon />}
                                                Continue
                                            </Button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))
                    }
                </div>

            </div>
        </Layout>
    )
}