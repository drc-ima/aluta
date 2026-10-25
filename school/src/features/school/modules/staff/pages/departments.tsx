import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { PageWrapper } from "@/features/school/components";
import CreateDepartmentDialog from "../components/createDepartmentDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSearchParams } from "react-router-dom";
import { useSchoolDepartments } from "../hooks";


export default function Departments() {
    const { selectedSchool } = useUserDefaultsProvider()
    const [searchParams, setSearchParams] = useSearchParams()
    const departments = useSchoolDepartments({ school_id: selectedSchool !== null ? selectedSchool?.id: "", enabled: selectedSchool !== null })
    return (
        <PageWrapper
            title="Departments"
            // description="Manage your staff here"
            actions={[
                {
                    children: "Add Departments",
                    size: "sm",
                    type: "button",
                    onClick: () => {
                        searchParams.set("action", "create")
                        setSearchParams(searchParams)
                    }
                }
            ]}

        >
            <div className="overflow-hidden rounded-lg border">
                <Table className="min-w-xl">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pr-0 px-6">Job Title</TableHead>
                            <TableHead className="pr-0 px-6">Description</TableHead>

                            <TableHead className="pr-0 px-6"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            departments.data?.map((department: any, index) => (
                                <TableRow key={index}>
                                    <TableCell className="pr-0 px-6">
                                        {department.name}
                                    </TableCell>
                                    <TableCell className="pr-0 px-6">
                                        {department.description}
                                    </TableCell>

                                    <TableCell className="pr-0 px-6">

                                    </TableCell>
                                </TableRow>
                            ))
                        }

                    </TableBody>
                </Table>
            </div>
            <CreateDepartmentDialog
                handleOpenChange={(open) => {
                    if (!open) {
                        searchParams.delete("action")
                        setSearchParams(searchParams)
                    }
                }}
                refetch={() => departments.refetch()}
            />
        </PageWrapper>
    )
}