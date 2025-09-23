import { NavItem } from '@/types/nav';
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { IoPersonCircleSharp } from "react-icons/io5";
import { MdPayments } from "react-icons/md";
import { FaBoxesStacked } from "react-icons/fa6";

export const managerNav: NavItem[] = [
    { icon: MdOutlineDashboardCustomize, label: 'Tableau de bord', href: '/manager/dashboard' },
    { icon: IoPersonCircleSharp, label: 'Liste des Banques', href: '/manager/dashboard/Clients' },
        { icon: FaBoxesStacked, label: 'Liste des consomable', href: '/manager/dashboard/consumable' },
                { icon: MdPayments, label: 'Liste des TPEs', href: '/manager/dashboard/tpe' },


]
