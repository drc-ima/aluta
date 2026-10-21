import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { SidebarContent } from "./sidebar";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { LayoutDashboard } from "lucide-react";
import { NavGroup } from "../ui/navGroup";


export function SidebarContents() {
    const { selectedSchool } = useUserDefaultsProvider()
    const navGroups = [
        {
            title: "General",
            items: [
                {
                    title: "Overview",
                    url: "/overview",
                    icon: LayoutDashboard,
                },
            ],
        },
        ...(selectedSchool
            ? [
                {
                    title: "Modules",
                    items: selectedSchool.modules?.filter((module: any) => module.module.slug).map((module: any) => ({
                        title: module.module.name,
                        url: `/${module.module.slug}`,
                        icon: () => (
                            <DynamicIcon
                                name={module.module.icon as IconName}
                                // className="size-4"
                            />
                        ),
                    })) ?? [],
                },
            ]
            : []),
            {
                title: "Settings",
                items: []
            }
    ];
    return (
        <SidebarContent>
            {
                navGroups.map((props) => (
                    <NavGroup key={props.title} {...props} />
                ))
            }
        </SidebarContent>
    )
}