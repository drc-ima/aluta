
import { TabsContent } from "@/components/ui/tabs";
import { PageWrapper } from "../../components";

export default function StaffPage(){
    return (
        <PageWrapper
            title="Staff"
            description="Manage your staff here"
            actions={[
                {
                    children: "Add Staff",
                    size: "sm",
                    type: "button"
                }
            ]}
            topNavs={[
                {
                    children: "Overview",
                    id:"overview",
                    disabled: false
                },
                {
                    children: "All",
                    id:"all",
                    disabled: false
                },
                {
                    children: "Departments",
                    id:"departments",
                    disabled: false
                }
            ]}
        >
            <TabsContent value="overview">

            </TabsContent>
        </PageWrapper>
    )
}

const AllTab = () => {

    <TabsContent value="overview">

    </TabsContent>
}