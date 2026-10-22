import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { PageWrapper } from "@/features/school/components";
import { useSchoolDepartments } from "@/features/school/hooks";
import { useState } from "react";
import CreateDepartmentDialog from "../components/createDepartmentDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function Departments() {
    const { selectedSchool } = useUserDefaultsProvider()
    const [openAdd, setOpenAdd] = useState(false)
    const departments = useSchoolDepartments({ school_id: selectedSchool?.id, enabled: selectedSchool !== null })
    return (
        <PageWrapper
            title="Departments"
            // description="Manage your staff here"
            actions={[
                {
                    children: "Add Departments",
                    size: "sm",
                    type: "button",
                    onClick: () => setOpenAdd(true)
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
                open={openAdd}
                handleOpenChange={(open) => setOpenAdd(open)}
                refetch={() => departments.refetch()}
            />
        </PageWrapper>
    )
}