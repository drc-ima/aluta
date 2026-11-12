import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { SidebarContent } from "./sidebar";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { LayoutDashboard } from "lucide-react";
import { NavGroup } from "../ui/navGroup";
import { useParams } from "react-router-dom";
import { useMemo } from "react";


export function SidebarContents() {
    const { selectedSchool } = useUserDefaultsProvider()
    const { moduleSlug } = useParams()
    const navGroups = useMemo(() => {
        if (!selectedSchool) return [];
        return [
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
            {
                title: "Modules",
                items: selectedSchool.modules?.filter((module: any) => module.module.slug).map((module: any) => ({
                    title: module.module.name,
                    url: `/${module.module.slug}`,
                    icon: () => (
                        <DynamicIcon
                            name={module.module.icon as IconName}
                        className="size-4"
                        />
                    ),
                })) ?? [],
            },
            {
                title: "Settings",
                items: []
            }
        ]
    }, [selectedSchool, moduleSlug]);
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