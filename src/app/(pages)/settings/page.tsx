"use client";
import { useState, useEffect } from 'react';
import { USERFETCH, updateUSER, updateUSERAccountManager } from '@/app/api/tickets';
import { useAuth } from '@/providers/AuthContext';

type UserData = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
};

type BankData = {
  id: number;
  code: string;
  name: string;
  phoneNumber: string;
  status: string;
  locationId: number;
  createdAt: string;
  updatedAt: string;
};

type UserResponse = {
  user: UserData;
  bank: BankData;
};

export default function SettingsPage() {
  const { user } = useAuth(); // ✅ get user from context
  const role_current = user?.role || 'Client'; // Default to 'client' if user or role is undefined
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  const [originalUserData, setOriginalUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  const [bankInfo, setBankInfo] = useState<BankData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await USERFETCH();
        const userData: UserResponse = response.data;
        
        const userDataObj = {
          firstName: userData.user.first_name,
          lastName: userData.user.last_name,
          email: userData.user.email,
          phoneNumber: '' // Phone number not in user object, will be handled separately
        };
        
        setUserData(userDataObj);
        setOriginalUserData(userDataObj);
        
        setBankInfo(userData.bank);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Erreur lors du chargement des données utilisateur');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Helper function to determine which update function to use based on role
  const getUpdateFunction = () => {
    return (role_current === 'admin' || role_current === 'ACCOUNT_MANAGER' || role_current === 'manager') 
      ? updateUSERAccountManager 
      : updateUSER;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      setError('');
      setSuccessMessage('');
      
      // Only send fields that have changed
      const updatePayload: { firstName?: string; lastName?: string; phoneNumber?: string; password?: string } = {};
      
      if (userData.firstName !== originalUserData.firstName) {
        updatePayload.firstName = userData.firstName;
      }
      if (userData.lastName !== originalUserData.lastName) {
        updatePayload.lastName = userData.lastName;
      }
      if (userData.phoneNumber !== originalUserData.phoneNumber) {
        updatePayload.phoneNumber = userData.phoneNumber;
      }
      
      // Only send update if there are actual changes
      if (Object.keys(updatePayload).length === 0) {
        setError('Aucune modification détectée');
        return;
      }
      
      const updateFunction = getUpdateFunction();
      await updateFunction(updatePayload);
      setSuccessMessage('Profil mis à jour avec succès!');
      
      // Update original data to reflect the changes
      setOriginalUserData(userData);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      setIsUpdating(true);
      setError('');
      setSuccessMessage('');
      
      // Only send password field for password changes
      const updatePayload = {
        password: passwordData.newPassword
      };
      
      const updateFunction = getUpdateFunction();
      await updateFunction(updatePayload);
      setSuccessMessage('Mot de passe changé avec succès!');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Erreur lors du changement de mot de passe');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Paramètres</h1>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="text-center space-y-3">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <div className="text-lg font-semibold text-blue-700">Chargement des paramètres...</div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-700 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="w-full grid grid-cols-2 gap-6">
        
        {/* Profile Information Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Informations du Profil</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleProfileUpdate}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={userData.firstName}
                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    disabled={isUpdating}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={userData.lastName}
                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    disabled={isUpdating}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={userData.phoneNumber}
                    onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                    disabled={isUpdating}
                    placeholder="+213..."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={userData.email}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Mise à jour...' : 'Mettre à jour le profil'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Changer le mot de passe</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    disabled={isUpdating}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    disabled={isUpdating}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Changement...' : 'Changer le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bank Information Section - Only for Client role */}
        {role_current === 'BANK_USER' && (
          <div className="bg-white col-span-2 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informations De la Banque</h2>
            </div>
            <div className="p-6">
              {bankInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nom de la banque</h3>
                      <p className="mt-1 text-sm text-gray-900">{bankInfo.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Code de la banque</h3>
                      <p className="mt-1 text-sm text-gray-900">{bankInfo.code}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Numéro de téléphone</h3>
                      <p className="mt-1 text-sm text-gray-900">{bankInfo.phoneNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bankInfo.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bankInfo.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Aucune information bancaire enregistrée</p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-500">
                    Ajouter une information bancaire
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}