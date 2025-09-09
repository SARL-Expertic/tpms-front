
import { clientNav } from './client'

import { NavItem } from '@/types/nav'
import { managerNav } from './manager'

export function getNavItems(role: string = 'client'): NavItem[] {
  switch (role) {
    case 'manager':
      return managerNav
    case 'client':
    default:
      return clientNav
  }
}
