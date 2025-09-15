import {  FiTrendingUp  } from 'react-icons/fi'
import { NavItem } from '@/types/nav';
import { IoFileTrayFull } from "react-icons/io5";
import { MdOutlineDashboardCustomize } from "react-icons/md";


export const managerNav: NavItem[] = [
    { icon: MdOutlineDashboardCustomize, label: 'Tableau de bord', href: '/manager/dashboard' },
    { icon: FiTrendingUp, label: 'Liste des Clients', href: '/manager/dashboard/gab' },
]
