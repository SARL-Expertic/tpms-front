import {  FiTrendingUp  } from 'react-icons/fi'
import { NavItem } from '@/types/nav';
import { IoFileTrayFull } from "react-icons/io5";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { MdInventory } from "react-icons/md";


export const clientNav: NavItem[] = [
  { icon: MdOutlineDashboardCustomize, label: 'Tableau de bord', href: '/client/dashboard' },
  { icon: MdInventory, label: 'Stock Mort', href: '/client/dashboard/dead-stock' },
]
