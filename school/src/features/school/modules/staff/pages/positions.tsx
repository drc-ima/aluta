import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { PageWrapper } from "@/features/school/components";
import { useSchoolPositions } from "@/features/school/hooks";
import { useState } from "react";
import { CreatePositionDrawer } from "../components/createPositionDrawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function Positions() {
    const { selectedSchool } = useUserDefaultsProvider()
    const positions = useSchoolPositions({school_id:selectedSchool?.id, enabled: selectedSchool !== null})
    const [openAdd, setOpenAdd] = useState(false)
    
    return (
            <PageWrapper
                title="Job Titles"
                description="Manage job titles of your staff."
                actions={[
                    {
                        children: "Add Job Title",
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
                                <TableHead className="pr-0 px-6">Employment Type</TableHead>
                                <TableHead className="pr-0 px-6">Rank</TableHead>
                                <TableHead className="pr-0 px-6"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                positions.data?.map((position: any, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="pr-0 px-6">
                                            {position.name}
                                        </TableCell>
                                        <TableCell className="pr-0 px-6">
                                            {position.description}
                                        </TableCell>
                                        <TableCell className="pr-0 px-6">
                                            {position.employment_type}
                                        </TableCell>
                                        <TableCell className="pr-0 px-6">
                                            {position.rank}
                                        </TableCell>
                                        <TableCell className="pr-0 px-6">

                                        </TableCell>
                                    </TableRow>
                                ))
                            }

                        </TableBody>
                    </Table>
                </div>
                <CreatePositionDrawer 
                    open={openAdd}
                    handleOpenChange={(open) => setOpenAdd(open)}
                    refetch={() => positions.refetch()}
                />
            </PageWrapper>
        )
}