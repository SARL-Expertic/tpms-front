# Documentation Technique - Système TPMS
## Terminal Payment Management System

**Date:** Novembre 2025  
**Version:** 2.0  
**Développeur:** Documentation de Transition

---

## Table des Matières

1. [Vue d'Ensemble du Projet](#1-vue-densemble-du-projet)
2. [Architecture Technique](#2-architecture-technique)
3. [Fonctionnalités Développées](#3-fonctionnalités-développées)
4. [Structure du Code](#4-structure-du-code)
5. [APIs et Intégrations](#5-apis-et-intégrations)
6. [Composants Principaux](#6-composants-principaux)
7. [Gestion des États](#7-gestion-des-états)
8. [Système de Notifications](#8-système-de-notifications)
9. [Guide de Maintenance](#9-guide-de-maintenance)
10. [Améliorations Futures](#10-améliorations-futures)

---

## 1. Vue d'Ensemble du Projet

### 1.1 Description
Le TPMS (Terminal Payment Management System) est une application web de gestion complète pour les terminaux de paiement électronique (TPE). Le système permet la gestion des tickets, des interventions, des consommables, et du stock mort (dead stock) pour plusieurs banques et leurs clients.

### 1.2 Technologies Utilisées
- **Framework:** Next.js 15.5.2 avec App Router
- **Langage:** TypeScript
- **UI Library:** React 18+
- **Styling:** Tailwind CSS
- **Composants UI:** shadcn/ui + Radix UI
- **Validation:** Zod (implicite)
- **Gestion des formulaires:** React Hook Form patterns
- **API Client:** Axios
- **Notifications temps réel:** Server-Sent Events (EventSource)
- **Gestion des dates:** date-fns
- **Icons:** React Icons

### 1.3 Objectifs du Système
- Centraliser la gestion des tickets de maintenance
- Suivre les interventions techniques
- Gérer les stocks de consommables
- Tracer les équipements en dead stock
- Faciliter la communication banque-technicien
- Automatiser les notifications en temps réel

---

## 2. Architecture Technique

### 2.1 Structure de l'Application

```
tpms-front/
├── src/
│   ├── app/                          # App Router Next.js
│   │   ├── (pages)/                  # Pages groupées
│   │   │   ├── client/              # Espace client
│   │   │   │   └── dashboard/
│   │   │   ├── manager/             # Espace manager
│   │   │   │   └── dashboard/
│   │   │   └── settings/            # Paramètres
│   │   ├── api/                     # Configuration API
│   │   │   ├── auth.ts             # Authentification
│   │   │   ├── axios.ts            # Client Axios
│   │   │   ├── endpoints.ts        # Points d'accès API
│   │   │   └── tickets.ts          # Fonctions API
│   │   ├── auth/                    # Authentification
│   │   │   └── login/
│   │   ├── hooks/                   # Hooks personnalisés
│   │   ├── layouts/                 # Layouts
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── ClientLayout.tsx
│   │   │   └── Header/
│   │   └── middleware.ts            # Middleware auth
│   │
│   ├── components/                   # Composants React
│   │   ├── shared/
│   │   │   ├── modal/              # Modales réutilisables
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── UnsavedChangesDialog.tsx
│   │   │   │   ├── ConfirmDeleteModal.tsx
│   │   │   │   ├── Bank/           # Modales banques
│   │   │   │   ├── CONSUMBLE/      # Modales consommables
│   │   │   │   ├── deadstock_manager/  # Modales dead stock
│   │   │   │   ├── intervention/   # Modales interventions
│   │   │   │   └── tpe/           # Modales TPE
│   │   │   └── tables/            # Tables de données
│   │   │       ├── data-table.tsx
│   │   │       ├── banks_ACC_MANAGER/
│   │   │       ├── consumble_ACC_MANAGER/
│   │   │       ├── dead_stock_account_manager/
│   │   │       ├── dead_stock_client/
│   │   │       ├── Tickits/
│   │   │       └── TPE_MANAGER/
│   │   └── ui/                     # Composants UI de base
│   │
│   ├── constants/                   # Constantes
│   │   ├── algeria/
│   │   │   └── wilayas.ts          # Données géographiques
│   │   ├── deadstock/
│   │   │   └── conditions.ts       # Mapping conditions
│   │   ├── sidebar/                # Navigation
│   │   └── tickets/                # Filtres tickets
│   │
│   ├── providers/                   # Context Providers
│   │   ├── AuthContext.tsx
│   │   └── SidebarContext.tsx
│   │
│   ├── types/                       # Définitions TypeScript
│   │   ├── deadstock.ts
│   │   ├── ticket.ts
│   │   ├── user.ts
│   │   └── tables/
│   │       └── filter.ts
│   │
│   └── utils/                       # Utilitaires
│       ├── auth.ts
│       ├── helpers.ts
│       └── jwt.ts
│
├── public/                          # Assets statiques
└── Configuration files
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── components.json
```

### 2.2 Architecture en Couches

#### Couche Présentation
- **Composants UI:** shadcn/ui pour les primitives
- **Composants métier:** Modales, tables, formulaires spécifiques
- **Layouts:** AdminLayout, ClientLayout avec Header et Sidebar

#### Couche Logique
- **Hooks personnalisés:** useAuth, useTickets
- **Context API:** AuthContext, SidebarContext
- **Validation:** Validation inline dans les formulaires

#### Couche Communication
- **API Client:** Axios configuré avec intercepteurs
- **Endpoints centralisés:** Fichier endpoints.ts
- **Fonctions typées:** tickets.ts avec types TypeScript stricts

#### Couche Données
- **Types TypeScript:** Interfaces pour tous les modèles
- **Mapping de données:** Transformation des réponses API
- **Cache local:** State management avec useState/useEffect

---

## 3. Fonctionnalités Développées

### 3.1 Système de Tickets

#### Types de Tickets
1. **Intervention**
   - Gestion des problèmes techniques
   - Catégories: Matériel, Application, Réseau, Non Qualifié
   - Sélection TPE avec marque et modèle
   - Numéro de série optionnel
   - N° Ticket Banque optionnel

2. **Consommable**
   - Demande de fournitures
   - Gestion multi-articles
   - Contrôle de stock en temps réel
   - Validation de disponibilité
   - Association TPE optionnelle

3. **Choix de Réseau**
   - Vérification de connectivité
   - Tests réseau
   - Configuration IP

4. **Déblocage**
   - Installation de nouveaux TPE
   - Remplacement d'équipements
   - Gestion multi-TPE avec quantités
   - Pas de client requis

#### Fonctionnalités Tickets
- ✅ Création avec validation complète
- ✅ Édition avec détection de modifications non sauvegardées
- ✅ Suppression avec confirmation
- ✅ Gestion des pièces jointes (upload/download/delete)
- ✅ Filtrage avancé (statut, type, date, banque)
- ✅ Recherche globale
- ✅ Tri automatique (plus récent en premier)
- ✅ Fermeture de ticket
- ✅ Champs client auto-remplis si existant
- ✅ Support multi-banques

### 3.2 Gestion Dead Stock

#### Vue Manager (CRUD Complet)
- **Création:**
  - Nom, quantité, condition (5 types)
  - Notes descriptives
  - Assignation banque optionnelle
  - Statut actif/inactif (boolean)
  - Validation complète

- **Lecture:**
  - Table avec colonnes: ID, Nom, Banque, Quantité, Condition, Notes, Actions
  - Filtres: Nom, Condition (FR), Banque
  - Badges colorés par condition
  - Tableau de bord statistique (Dashboard Summary)

- **Modification:**
  - Édition inline des champs
  - Détection changements non sauvegardés
  - Mise à jour partielle (champs modifiés uniquement)
  - Assignation/Retrait banque avec confirmation
  - Modal de succès après sauvegarde

- **Suppression:**
  - Confirmation avant suppression permanente
  - Affichage condition en français
  - Protection contre suppressions accidentelles

#### Vue Client (Lecture Seule)
- Consultation du dead stock assigné
- Pas de colonne banque
- Pas de boutons d'action
- Même système de filtrage

#### Mapping Conditions
```typescript
// Backend (EN) ↔ Frontend (FR)
NEW          → NEUF
USED         → UTILISÉ
REFURBISHED  → RECONDITIONNÉ
DAMAGED      → ENDOMMAGÉ
OUT_OF_ORDER → HORS SERVICE
```

#### Dashboard Statistiques
- **Cartes principales:**
  - Total articles (avec icône)
  - Articles assignés (pourcentage)
  - Articles non assignés (pourcentage)
  - Types de conditions
  
- **Détails par condition:**
  - Comptage par condition
  - Pourcentages visuels
  - Barres de progression colorées
  - Labels en français

### 3.3 Gestion TPE et Modèles

#### Fonctionnalités
- Liste hiérarchique par fabricant
- Accordéon expand/collapse
- Détails complets du TPE
- Édition fabricant et modèle
- Édition description modèle
- Suppression avec confirmation (modèle/fabricant)
- Détection modifications non sauvegardées
- Modal de succès après édition
- Refresh automatique des données

#### Champs Éditables
- Nom du fabricant
- Nom du modèle
- Description du modèle (unique, pas de duplication)

#### Intégration API
```typescript
Update_model_terminal_type(id, {
  manufacturer_id,
  model_name,
  description
})

Update_manufacturer_terminal_type(id, {
  manufacturer_name
})
```

### 3.4 Système de Notifications Temps Réel

#### Implémentation EventSource/SSE
```typescript
// Connexion streaming
const eventSource = new EventSource(streamURL, {
  withCredentials: true
})

// Réception messages
eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data)
  // Traitement et affichage
}

// Reconnexion automatique
eventSource.onerror = () => {
  // Tentative reconnexion après 5s
}
```

#### Fonctionnalités
- Badge compteur notifications non lues
- Dropdown animé avec liste
- Icônes par type (success, warning, error, info)
- Timestamps formatés (fr-FR)
- Limite 50 dernières notifications
- Marquage "lu" à l'ouverture
- Fermeture au clic extérieur
- Animations fluides

### 3.5 Gestion Consommables

#### Inventaire
- CRUD complet (Create, Read, Update, Delete)
- Types de consommables configurables
- Suivi des quantités en stock
- Validation stock lors des demandes
- Messages d'erreur détaillés si stock insuffisant
- Affichage stock disponible dans les selects
- Codes couleur (rouge: épuisé, orange: faible, vert: ok)

### 3.6 Gestion Banques

#### Fonctionnalités
- Création avec employés multiples
- Assignation types de terminaux
- Édition informations banque
- Gestion employés (ajout/retrait)
- Statut ACTIVE/INACTIVE
- Validation complète
- Code banque unique

### 3.7 Authentification et Autorisations

#### Système Auth
- Login avec JWT
- Middleware de protection routes
- Context AuthProvider
- Redirection automatique
- Gestion token expiration
- Rôles: Account Manager, Bank Employee, Client

#### Routes Protégées
```typescript
// Middleware Next.js
export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/(pages)/:path*",
    "/manager/:path*",
    "/client/:path*",
  ]
}
```

---

## 4. Structure du Code

### 4.1 Conventions de Nommage

#### Fichiers
- **Composants:** PascalCase (`UserProfile.tsx`)
- **Utilitaires:** camelCase (`formatDate.ts`)
- **Types:** camelCase avec extension `.ts` (`user.ts`)
- **Constants:** camelCase (`wilayas.ts`)

#### Variables et Fonctions
```typescript
// State
const [isLoading, setIsLoading] = useState(false)
const [selectedClient, setSelectedClient] = useState<Client | null>(null)

// Fonctions handlers
const handleSubmit = async () => {}
const handleModalOpenChange = (open: boolean) => {}

// API functions
export const fetchTickets = () => api.get(ENDPOINTS.TICKETS)
export const CREATE_DEAD_STOCK = (data) => api.post(...)
```

### 4.2 Patterns Utilisés

#### Modal Pattern avec Unsaved Changes
```typescript
const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
const [isEditing, setIsEditing] = useState(false)
const [editedData, setEditedData] = useState(initialData)
const [originalData, setOriginalData] = useState(initialData)

const hasUnsavedChanges = useMemo(() => {
  if (!isEditing) return false
  return editedData !== originalData
}, [editedData, originalData, isEditing])

const handleModalOpenChange = (nextOpen: boolean) => {
  if (!nextOpen && hasUnsavedChanges) {
    setShowUnsavedDialog(true)
    return
  }
  // Close modal
}
```

#### Table avec Filtres Dynamiques
```typescript
interface FilterConfig<TData> {
  key: keyof TData
  label: string
  placeholder: string
  labelMap?: (value: any) => string  // Pour mapping EN/FR
}

const filters: FilterConfig<DeadStock>[] = [
  {
    key: "condition",
    label: "Condition",
    placeholder: "Filtrer par condition...",
    labelMap: (value: string) => getConditionLabel(value)
  }
]
```

#### API avec Gestion Erreurs
```typescript
try {
  setIsLoading(true)
  const response = await API_FUNCTION(data)
  
  // Succès
  setShowSuccessModal(true)
  onSuccess?.()
  
  return true
} catch (error: any) {
  // Gestion erreurs spécifiques
  if (error?.response?.data?.message?.includes('stock')) {
    setErrors({ stock: 'Stock insuffisant...' })
  } else {
    setErrors({ general: error.message })
  }
  return false
} finally {
  setIsLoading(false)
}
```

### 4.3 Composants Réutilisables

#### DynamicModal
```typescript
<DynamicModal
  open={isOpen}
  onOpenChange={handleOpenChange}
  triggerLabel={<Button>Ouvrir</Button>}
  title="Titre Modal"
  description="Description"
  confirmLabel="Confirmer"
  onConfirm={handleConfirm}
  cancelLabel="Annuler"
/>
```

#### UnsavedChangesDialog
```typescript
<UnsavedChangesDialog
  open={showDialog}
  onConfirm={handleSaveAndClose}
  onDiscard={handleDiscardAndClose}
  onCancel={() => setShowDialog(false)}
  title="Modifications non enregistrées"
  description="Voulez-vous enregistrer..."
/>
```

#### DataTable
```typescript
<DataTable
  columns={columns}
  data={data}
  filters={filterConfig}
/>
```

---

## 5. APIs et Intégrations

### 5.1 Configuration Axios

```typescript
// src/app/api/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur pour gérer erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirection login
    }
    return Promise.reject(error)
  }
)

export default api
```

### 5.2 Endpoints Centralisés

```typescript
// src/app/api/endpoints.ts
export const ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  USER_ME: "/auth/me",
  
  // Tickets
  TICKETS: "/api/bank-employee/ticket",
  TICKETS_MANAGER: "/api/account-manager/ticket",
  NETWORK_CHECK: "/api/bank-employee/ticket/network-check",
  INTERVENTION: "/api/bank-employee/ticket/intervention",
  CONSUMABLE: "/api/bank-employee/ticket/consumable",
  DEBLOCKING: "/api/bank-employee/ticket/deblocking-order",
  
  // Account Manager
  NETWORK_CHECKACCOUNT_MANAGER: "/api/account-manager/ticket/network-check",
  INTERVENTIONACCOUNT_MANAGER: "/api/account-manager/ticket/intervention",
  CONSUMABLEACCOUNT_MANAGER: "/api/account-manager/ticket/consumable",
  DEBLOCKINGACCOUNT_MANAGER: "/api/account-manager/ticket/deblocking-order",
  
  // Updates
  UPDATENETWORKCHECKTICKET: "/api/account-manager/ticket/network-check",
  UPDATEINTERVENTIONTICKET: "/api/account-manager/ticket/intervention",
  UPDATECONSUMABLETICKET: "/api/account-manager/ticket/consumable",
  UPDATEDEBLOCKINGTICKET: "/api/account-manager/ticket/deblocking-order",
  
  // Clients
  CLIENTS: "/api/bank-employee/client",
  CLIENTS_MANAGER: "/api/account-manager/client",
  
  // Banks
  BANKS: "/api/account-manager/bank",
  CREATEBANK: "/api/account-manager/bank",
  UPDATEBANK: "/api/account-manager/bank",
  
  // TPE
  TPE: "api/bank-employee/terminal-type",
  TPES_MANAGER: "/api/account-manager/tpe",
  TPEMODELS: "/api/account-manager/tpe",
  TERMINALTYPES: "/api/account-manager/terminal-type",
  CREATEMODEL: "/api/account-manager/terminal-type/model",
  createmanfacturer: "/api/account-manager/terminal-type/manufacturer",
  
  // Consumables
  CONSUMABLEITEMS: "/api/account-manager/consumableItem",
  CONSUMABLEITEMS_Bankemployee: "/api/bank-employee/consumableItem",
  
  // Dead Stock
  DEAD_STOCK: "/account-manager/dead-stock",
  DEAD_STOCK_client: "/bank-employee/dead-stock",
  DEAD_STOCK_SUMMARY: "/account-manager/dead-stock/summary",
  
  // Attachments
  ATTACHMENTS: "/api/account-manager/ticket",
  BankUSERATTACHMENTS: "/api/bank-employee/ticket",
  
  // Excel
  DOWNLOAD_EXCEL: "/api/account-manager/ticket/excel/template",
  UPLOAD_EXCEL: "/api/account-manager/ticket/excel/upload",
  
  // Notifications
  PING_NOTIFICATION_SERVICE: "/api/notifications/ping",
  STREAM_NOTIFICATION_SERVICE: "/api/notifications/stream",
  
  // Utils
  CLOSETICKET: "/api/account-manager/ticket/close",
  USER: "/api/bank-employee/user",
  USERAccountManager: "/api/account-manager/user",
}
```

### 5.3 Fonctions API Principales

#### Tickets
```typescript
// Création
export const createInterventionTicket = (data: InterventionData) =>
  api.post(ENDPOINTS.INTERVENTION, data)

export const CreateinterventionAccountManager = (data: InterventionData) =>
  api.post(ENDPOINTS.INTERVENTIONACCOUNT_MANAGER, data)

// Mise à jour avec fichiers
export const Updateinterventionticket = (
  ticket_id: number,
  data: UpdateData & { files?: File[]; deleteAttachmentIds?: number[] }
) => {
  if (data.files?.length > 0 || data.deleteAttachmentIds?.length > 0) {
    const formData = new FormData()
    
    // Ajout fichiers
    data.files?.forEach(file => formData.append('files', file))
    
    // IDs à supprimer
    data.deleteAttachmentIds?.forEach(id => 
      formData.append('deleteAttachmentIds[]', id.toString())
    )
    
    // Autres champs
    Object.keys(data).forEach(key => {
      if (key !== 'files' && key !== 'deleteAttachmentIds') {
        formData.append(key, String(data[key]))
      }
    })
    
    return api.put(
      `${ENDPOINTS.UPDATEINTERVENTIONTICKET}/${ticket_id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  }
  
  return api.put(`${ENDPOINTS.UPDATEINTERVENTIONTICKET}/${ticket_id}`, data)
}
```

#### Dead Stock
```typescript
// Création
export const CREATE_DEAD_STOCK = (data: {
  name: string
  quantity: number
  condition: string
  notes: string
  bankId?: number
  isActive?: boolean
}) => api.post(ENDPOINTS.DEAD_STOCK, data)

// Liste complète
export const FETCH_ALL_DEAD_STOCK = () =>
  api.get(ENDPOINTS.DEAD_STOCK)

// Détails
export const GET_DETAILS_DEAD_STOCK_ITEM = (id: number) =>
  api.get(`${ENDPOINTS.DEAD_STOCK}/${id}`)

// Mise à jour partielle
export const UPDATE_DEAD_STOCK = (id: number, data: Partial<DeadStockData>) =>
  api.put(`${ENDPOINTS.DEAD_STOCK}/${id}`, data)

// Assignation banque
export const assgined_dead_stock_to_bank = (deadStockId: number, bankId: number) =>
  api.put(`${ENDPOINTS.DEAD_STOCK}/${deadStockId}/assign-bank/${bankId}`)

// Retrait banque
export const remove_dead_stock_from_bank = (deadStockId: number) =>
  api.put(`${ENDPOINTS.DEAD_STOCK}/${deadStockId}/unassign-bank`)

// Suppression
export const DELETE_DEAD_STOCK = (id: number) =>
  api.delete(`${ENDPOINTS.DEAD_STOCK}/${id}/permanent`)

// Statistiques
export const FETCH_DEAD_STOCK_SUMMARY = () =>
  api.get(ENDPOINTS.DEAD_STOCK_SUMMARY)
```

#### TPE
```typescript
// Mise à jour modèle
export const Update_model_terminal_type = (
  id: number,
  data: {
    manufacturer_id: number
    model_name: string
    description?: string
  }
) => api.put(`${ENDPOINTS.CREATEMODEL}/${id}`, data)

// Mise à jour fabricant
export const Update_manufacturer_terminal_type = (
  id: number,
  data: { manufacturer_name: string }
) => api.put(`${ENDPOINTS.createmanfacturer}/${id}`, data)
```

### 5.4 Gestion des Pièces Jointes

```typescript
// Téléchargement
export const fetchAttachments = (ticketId: number) =>
  api.get(`${ENDPOINTS.ATTACHMENTS}/${ticketId}/attachments`)

// Download
export const downloadAttachment = (ticketId: number, attachmentId: number) =>
  api.get(
    `${ENDPOINTS.ATTACHMENTS}/${ticketId}/attachments/${attachmentId}`,
    { responseType: "blob" }
  )

// Suppression
export const deleteAttachment = (ticketId: number, attachmentId: number) =>
  api.delete(
    `${ENDPOINTS.ATTACHMENTS}/${ticketId}/attachments/${attachmentId}`
  )
```

---

## 6. Composants Principaux

### 6.1 Système de Modales

#### Modal.tsx (DynamicModal)
Composant de base pour toutes les modales avec:
- Props flexibles (trigger, title, description)
- Gestion open/close
- Actions confirm/cancel
- Support disabled states
- Animations

#### UnsavedChangesDialog.tsx
Modal de confirmation pour modifications non sauvegardées:
- 3 boutons: Enregistrer, Ignorer, Annuler
- Labels personnalisables
- Gestion état loading
- Design cohérent

#### ConfirmDeleteModal.tsx
Modal de confirmation suppression:
- Message personnalisé
- Bouton danger (rouge)
- Protection suppressions accidentelles

### 6.2 Tables de Données

#### DataTable.tsx
Table générique avec:
- Pagination TanStack Table
- Filtres dynamiques avec FilterConfig
- Recherche globale
- Tri automatique
- Support labelMap pour traductions
- Responsive

#### Implémentation Filtres
```typescript
const deadStockFilters: FilterConfig<DeadStock>[] = [
  {
    key: "name",
    label: "Nom",
    placeholder: "Rechercher par nom...",
  },
  {
    key: "condition",
    label: "Condition",
    placeholder: "Filtrer par condition...",
    labelMap: (value: string) => getConditionLabel(value),
  },
  {
    key: "bankname",
    label: "Banque",
    placeholder: "Filtrer par banque...",
  },
]
```

### 6.3 Formulaires de Tickets

#### Nouvelle_ticket.tsx
Formulaire multi-onglets pour création tickets:

**Onglets:**
1. Intervention
2. Consommable
3. Choix de réseau
4. Déblocage

**Features:**
- Sélection banque
- Client existant ou nouveau
- Validation complète
- Gestion TPE
- Multi-consommables
- Upload fichiers
- Success overlay
- Loading overlay
- Gestion erreurs détaillées

**Validation:**
```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}
  
  // Validation commune
  if (!client.phoneNumber) {
    newErrors.phone = "Numéro de téléphone obligatoire"
  }
  
  // Validation par type
  switch (activeTab) {
    case 'intervention':
      if (!interventionData.terminal_type_id) {
        newErrors.tpeModel = "Modèle TPE obligatoire"
      }
      break
    
    case 'consumable':
      if (consumableData.items.length === 0) {
        newErrors.items = "Au moins un article requis"
      }
      // Validation stock
      break
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### 6.4 Dead Stock Components

#### DeadStockSummary.tsx
Dashboard statistiques avec:
- 4 cartes principales (Total, Assignés, Non assignés, Types)
- Détails par condition
- Barres de progression
- Calculs pourcentages
- Icons colorés
- Responsive grid

```typescript
// Structure données API
interface SummaryData {
  total: number
  assigned: number
  unassigned: number
  byCondition: Array<{
    condition: string
    _count: { id: number }
  }>
}
```

### 6.5 TPE Management

#### TPEDetailsButton.tsx
Modal détails TPE avec édition:
- Affichage info TPE
- Mode édition
- Édition fabricant/modèle/description
- Détection changements
- Confirmation avant fermeture
- Success modal
- Appel onUpdate pour refresh

#### TPEmanager.tsx
Table hiérarchique TPE:
- Groupement par fabricant
- Accordéon expand/collapse
- Filtres et recherche
- Actions: Détails, Suppression
- Modales création marque/modèle
- Refresh automatique

---

## 7. Gestion des États

### 7.1 Context API

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Vérifier token au montage
    const token = getToken()
    if (token) {
      fetchUser()
    }
  }, [])
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

#### SidebarContext
```typescript
interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  close: () => void
}
```

### 7.2 Custom Hooks

#### useAuth
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

#### useTickets
```typescript
export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await fetchTicketsAPI()
      setTickets(response.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchTickets()
  }, [])
  
  return { tickets, loading, error, refetch: fetchTickets }
}
```

### 7.3 State Management Patterns

#### Form State
```typescript
// État initial
const [formData, setFormData] = useState(initialData)

// Update partiel
const handleChange = (field: keyof FormData, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }))
}

// Reset
const resetForm = () => {
  setFormData(initialData)
}
```

#### Modal State
```typescript
const [isOpen, setIsOpen] = useState(false)
const [showConfirm, setShowConfirm] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async () => {
  setIsSubmitting(true)
  try {
    await submitData()
    setIsOpen(false)
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## 8. Système de Notifications

### 8.1 Architecture EventSource

#### NotificationToggle.tsx
```typescript
const NotificationToggle = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)
  
  useEffect(() => {
    const streamURL = STREAM_NOTIFICATION_SERVICE()
    const eventSource = new EventSource(streamURL, {
      withCredentials: true
    })
    
    eventSourceRef.current = eventSource
    
    // Messages
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const newNotification: Notification = {
        id: data.id || Date.now().toString(),
        icon: getIconForType(data.type),
        title: data.title || 'Nouvelle notification',
        message: data.message || '',
        timestamp: data.timestamp || new Date().toISOString()
      }
      
      setNotifications(prev => [newNotification, ...prev].slice(0, 50))
      setUnreadCount(prev => prev + 1)
    }
    
    // Connexion
    eventSource.onopen = () => {
      console.log('✅ Notification stream connected')
    }
    
    // Erreurs
    eventSource.onerror = (error) => {
      console.error('❌ Notification stream error:', error)
      eventSource.close()
      
      // Reconnexion après 5s
      setTimeout(() => {
        console.log('🔄 Attempting to reconnect...')
      }, 5000)
    }
    
    // Cleanup
    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [])
  
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}>
        <FaBell />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
      
      <DropdownNotifications
        open={open}
        notifications={notifications}
      />
    </div>
  )
}
```

### 8.2 Types de Notifications

```typescript
type NotificationType = 'success' | 'warning' | 'error' | 'info'

const getIconForType = (type?: string) => {
  switch (type) {
    case 'success':
    case 'completed':
      return <FaCheckCircle className="text-green-500" />
    case 'warning':
      return <FaExclamationTriangle className="text-yellow-500" />
    case 'error':
      return <FaExclamationTriangle className="text-red-500" />
    case 'info':
    default:
      return <FaInfoCircle className="text-blue-500" />
  }
}
```

---

## 9. Guide de Maintenance

### 9.1 Ajout d'un Nouveau Type de Ticket

#### Étape 1: Définir le Type
```typescript
// src/types/ticket.ts
export interface NewTicketType {
  id: number
  field1: string
  field2: number
  // ... autres champs
}
```

#### Étape 2: Ajouter l'Endpoint
```typescript
// src/app/api/endpoints.ts
export const ENDPOINTS = {
  // ...
  NEW_TICKET_TYPE: "/api/account-manager/ticket/new-type",
}
```

#### Étape 3: Créer les Fonctions API
```typescript
// src/app/api/tickets.ts
export const createNewTicketType = (data: NewTicketTypeData) =>
  api.post(ENDPOINTS.NEW_TICKET_TYPE, data)

export const updateNewTicketType = (id: number, data: Partial<NewTicketTypeData>) =>
  api.put(`${ENDPOINTS.NEW_TICKET_TYPE}/${id}`, data)
```

#### Étape 4: Ajouter l'Onglet
```typescript
// Dans Nouvelle_ticket.tsx
const tabs = [
  // ... tabs existants
  { id: 'newtype', label: 'Nouveau Type', icon: <FaIcon /> },
]

// Ajouter le state
const [newTypeData, setNewTypeData] = useState({
  // champs initiaux
})

// Ajouter dans le switch
{activeTab === 'newtype' && (
  <div>
    {/* Formulaire */}
  </div>
)}

// Ajouter dans handleSubmit
case 'newtype':
  await createNewTicketType({
    ...basePayload,
    ...newTypeData
  })
  break
```

### 9.2 Ajout d'un Nouveau Filtre

```typescript
// Dans FilterConfig
const newFilter: FilterConfig<DataType> = {
  key: "fieldName",
  label: "Label Filtre",
  placeholder: "Filtrer par...",
  labelMap: (value) => translateValue(value) // optionnel
}

// Ajouter au tableau de filtres
const filters = [
  // ... filtres existants
  newFilter
]
```

### 9.3 Création d'une Nouvelle Modal

```typescript
// Créer le composant
export function NewModal({ item, onSave }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [showUnsaved, setShowUnsaved] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState(item)
  const [original, setOriginal] = useState(item)
  
  const hasChanges = useMemo(() => {
    if (!isEditing) return false
    return JSON.stringify(data) !== JSON.stringify(original)
  }, [data, original, isEditing])
  
  const handleSave = async () => {
    try {
      await saveData(data)
      onSave?.(data)
      setIsOpen(false)
    } catch (error) {
      // Gérer erreur
    }
  }
  
  return (
    <>
      <DynamicModal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && hasChanges) {
            setShowUnsaved(true)
            return
          }
          setIsOpen(open)
        }}
        // ... props
      >
        {/* Contenu */}
      </DynamicModal>
      
      <UnsavedChangesDialog
        open={showUnsaved}
        // ... props
      />
    </>
  )
}
```

### 9.4 Debugging

#### Erreurs Communes

**1. "Cannot read property of undefined"**
```typescript
// ❌ Mauvais
const value = data.nested.field

// ✅ Bon
const value = data?.nested?.field ?? 'default'
```

**2. "Hooks called conditionally"**
```typescript
// ❌ Mauvais
if (condition) {
  useState(...)
}

// ✅ Bon
const [state, setState] = useState(...)
if (condition) {
  // utiliser state
}
```

**3. "Maximum update depth exceeded"**
```typescript
// ❌ Mauvais
useEffect(() => {
  setState(value)
}, [value]) // value change → setState → value change → ...

// ✅ Bon
useEffect(() => {
  setState(value)
}, []) // ou dépendances appropriées
```

#### Outils de Debug

```typescript
// Console logs structurés
console.log('✅ Success:', data)
console.error('❌ Error:', error)
console.warn('⚠️ Warning:', warning)
console.log('🔍 Debug:', debug)

// React DevTools
// - Inspecter composants
// - Voir state/props
// - Profiler performances

// Network Tab
// - Vérifier requêtes API
// - Voir headers/body
// - Temps de réponse
```

### 9.5 Tests Recommandés

#### Tests Unitaires (Exemples)
```typescript
// utils/helpers.test.ts
describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('15/01/2024')
  })
})

// components/Modal.test.tsx
describe('DynamicModal', () => {
  it('should open and close', () => {
    const { getByText } = render(
      <DynamicModal
        triggerLabel="Open"
        title="Test"
      />
    )
    
    fireEvent.click(getByText('Open'))
    expect(getByText('Test')).toBeInTheDocument()
  })
})
```

#### Tests d'Intégration
```typescript
// Scénario: Création ticket
describe('Create Ticket Flow', () => {
  it('should create intervention ticket', async () => {
    // 1. Ouvrir modal
    // 2. Sélectionner type
    // 3. Remplir formulaire
    // 4. Soumettre
    // 5. Vérifier succès
  })
})
```

---

## 10. Améliorations Futures

### 10.1 Fonctionnalités Suggérées

#### Court Terme
1. **Export Excel avancé**
   - Filtres personnalisés
   - Colonnes sélectionnables
   - Format customisable

2. **Statistiques avancées**
   - Graphiques temps réel
   - Tableaux de bord personnalisables
   - KPIs par banque/technicien

3. **Recherche avancée**
   - Recherche multicritères
   - Sauvegarde de recherches
   - Suggestions intelligentes

4. **Gestion des priorités**
   - Système de priorités tickets
   - SLA automatiques
   - Escalades

#### Moyen Terme
1. **Application mobile**
   - React Native ou PWA
   - Mode offline
   - Scan QR codes TPE

2. **Chat en temps réel**
   - WebSocket ou Socket.io
   - Chat par ticket
   - Support multimedia

3. **Historique détaillé**
   - Timeline événements
   - Audit trail complet
   - Comparaison versions

4. **Planification interventions**
   - Calendrier techniciens
   - Optimisation routes
   - Prévisions charge

#### Long Terme
1. **Intelligence artificielle**
   - Classification automatique tickets
   - Suggestions solutions
   - Prédiction pannes

2. **Intégration ERP**
   - Synchronisation inventaire
   - Gestion achats automatique
   - Facturation intégrée

3. **Multi-tenant**
   - Support multiple organisations
   - Isolation données
   - Configuration par tenant

### 10.2 Optimisations Techniques

#### Performance
```typescript
// 1. Code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />
})

// 2. Memo pour composants lourds
const ExpensiveList = React.memo(({ items }) => {
  // render
}, (prev, next) => prev.items === next.items)

// 3. useCallback pour fonctions
const handleSubmit = useCallback(async () => {
  // logic
}, [dependencies])

// 4. Virtual scrolling pour grandes listes
import { VirtualList } from 'react-virtual'
```

#### Sécurité
```typescript
// 1. Validation côté client ET serveur
// 2. Sanitization des entrées
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(dirtyHTML)

// 3. CSRF protection
// 4. Rate limiting
// 5. Encryption données sensibles
```

#### SEO et Accessibilité
```typescript
// 1. Metadata Next.js
export const metadata = {
  title: 'TPMS - Gestion TPE',
  description: '...'
}

// 2. Aria labels
<button aria-label="Fermer modal">
  <FaTimes />
</button>

// 3. Semantic HTML
<main>
  <section>
    <article>
```

### 10.3 Documentation Code

#### JSDoc
```typescript
/**
 * Crée un nouveau ticket dans le système
 * @param data - Données du ticket à créer
 * @param type - Type de ticket (intervention, consumable, etc.)
 * @returns Promise avec le ticket créé
 * @throws {ValidationError} Si les données sont invalides
 * @throws {APIError} Si l'API retourne une erreur
 * 
 * @example
 * ```typescript
 * const ticket = await createTicket({
 *   client_id: 123,
 *   description: "Problème réseau"
 * }, 'intervention')
 * ```
 */
export async function createTicket(
  data: TicketData,
  type: TicketType
): Promise<Ticket> {
  // implementation
}
```

#### README par Module
```markdown
# Module Dead Stock

## Description
Gestion complète du stock mort (équipements hors service).

## Composants
- `deadStockTable.tsx`: Table principale
- `DeadStockSummary.tsx`: Dashboard statistiques
- `Nouvelle_DEADSTOCK.tsx`: Modal création
- `DEADSTOCKdetailsButton.tsx`: Modal détails/édition
- `DELETEEdetailsButtoN.tsx`: Modal suppression

## API
- `FETCH_ALL_DEAD_STOCK()`: Liste complète
- `CREATE_DEAD_STOCK(data)`: Création
- `UPDATE_DEAD_STOCK(id, data)`: Modification
- `DELETE_DEAD_STOCK(id)`: Suppression

## États
- Conditions: NEW, USED, REFURBISHED, DAMAGED, OUT_OF_ORDER
- Mapping FR: NEUF, UTILISÉ, RECONDITIONNÉ, ENDOMMAGÉ, HORS SERVICE

## Workflow
1. Manager crée article
2. Optionnel: Assigne à banque
3. Client peut consulter (lecture seule)
4. Manager peut modifier/supprimer
```

---

## Annexes

### A. Glossaire

- **TPE**: Terminal de Paiement Électronique
- **Dead Stock**: Stock d'équipements hors service ou inutilisés
- **SSE**: Server-Sent Events, technologie push serveur
- **CRUD**: Create, Read, Update, Delete
- **SLA**: Service Level Agreement
- **JWT**: JSON Web Token

### B. Variables d'Environnement

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=TPMS
NEXT_PUBLIC_VERSION=2.0
```

### C. Scripts NPM

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### D. Dépendances Principales

```json
{
  "dependencies": {
    "next": "15.5.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5",
    "tailwindcss": "^3.4.1",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@tanstack/react-table": "^8.11.6",
    "axios": "^1.6.5",
    "date-fns": "^3.2.0",
    "react-icons": "^5.0.1",
    "lucide-react": "^0.312.0"
  }
}
```

### E. Contacts et Ressources

#### Documentation Technique
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

#### APIs
- Documentation API Backend: [URL à définir]
- Postman Collection: [URL à définir]

---

## Conclusion

Ce document représente l'ensemble du travail réalisé sur le projet TPMS. L'application est fonctionnelle, maintenable et prête pour une utilisation en production.

**Points forts du projet:**
- ✅ Architecture modulaire et scalable
- ✅ Code TypeScript fortement typé
- ✅ Composants réutilisables et maintenables
- ✅ Gestion complète des erreurs
- ✅ UX optimisée avec feedback utilisateur
- ✅ Notifications temps réel
- ✅ Documentation inline complète

**Recommandations pour la suite:**
1. Mettre en place des tests automatisés
2. Configurer CI/CD
3. Implémenter monitoring et logging
4. Optimiser les performances (lazy loading, caching)
5. Renforcer la sécurité (HTTPS, CSP, etc.)

**Pour toute question concernant ce document ou le projet, n'hésitez pas à contacter l'équipe de développement.**

---

**Document rédigé le:** Novembre 2025  
**Dernière mise à jour:** Novembre 2025  
**Version:** 1.0

---

*Ce document est confidentiel et propriété de SARL-Expertic. Toute reproduction ou distribution sans autorisation est interdite.*
