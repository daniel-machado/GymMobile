import { createContext, ReactNode, useState, useEffect } from 'react';

import { api } from '@services/api';
import { UserDTO } from '@dtos/UserDTO';
import { storageUserGet, storageUserRemove, storageUserSave } from '@storage/storageUser';
import { storageAuthTokenGet, storageAuthTokenRemove, storageAuthTokenSave } from '@storage/storageAuthToken';

export type AuthContextDataProps = {
  user: UserDTO;
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  isLoadingUserStorageData: boolean;
  signOut: () => Promise<void>;
  refreshedToken: string;
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps){
  const [user, setUser] = useState<UserDTO>({} as UserDTO);
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);
  const [refreshedToken, setRefreshedToken] = useState('');

  async function UserAndTokenUpdate(userData: UserDTO, token: string){
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  }

  async function storageUserAndTokenSave(userData: UserDTO, token: string){
    try {
      setIsLoadingUserStorageData(true);
      await storageUserSave(userData);
      await storageAuthTokenSave(token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function signIn(email: string, password: string){
    try {
      const { data } = await api.post('/sessions', {email, password});
      if(data.user && data.token){
        setIsLoadingUserStorageData(true);
        storageUserAndTokenSave(data.user, data.token);
        UserAndTokenUpdate(data.user, data.token);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function signOut(){
    try {
      setIsLoadingUserStorageData(true);
      setUser( {} as UserDTO);
      await storageUserRemove();
      await storageAuthTokenRemove();

    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function updateUserProfile(userUpdated: UserDTO){
    try {
      setUser(userUpdated);
      await storageUserSave(userUpdated);

    } catch (error) {
      throw error;
    }
  }

  async function loadUserData(){
    try {
      setIsLoadingUserStorageData(true);
      const userLogged = await storageUserGet();
      const token = await storageAuthTokenGet();

      if(token && userLogged){
        UserAndTokenUpdate(userLogged, token);
      }
      
    } catch (error) {
      throw error;
    }finally {
      setIsLoadingUserStorageData(false);
    }
  }

  function refreshTokenUpdated(newToken: string){
    setRefreshedToken(newToken);
  }

  useEffect(() => {
    loadUserData()
  }, []);

  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager({signOut, refreshTokenUpdated});

    return () => {
      subscribe();
    }
  }, [signOut])

  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn,
      updateUserProfile,
      signOut,
      isLoadingUserStorageData,
      refreshedToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}