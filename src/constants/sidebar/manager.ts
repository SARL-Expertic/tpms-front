import { NavItem } from '@/types/nav';
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { IoPersonCircleSharp } from "react-icons/io5";
import { MdPayments } from "react-icons/md";


export const managerNav: NavItem[] = [
    { icon: MdOutlineDashboardCustomize, label: 'Tableau de bord', href: '/manager/dashboard' },
    { icon: IoPersonCircleSharp, label: 'Liste des Clients', href: '/manager/dashboard/Clients' },
        { icon: MdPayments, label: 'Liste des TPE', href: '/manager/dashboard/TPES' },

]
