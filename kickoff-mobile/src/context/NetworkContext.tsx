import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextType {
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isConnected: true });

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsub();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  return useContext(NetworkContext);
};
