import React, { createContext, useContext } from 'react';

const VsCodeApiContext = createContext<any>(null);

export const VsCodeApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const vscode = acquireVsCodeApi();
  return (
    <VsCodeApiContext.Provider value={vscode}>
      {children}
    </VsCodeApiContext.Provider>
  );
};

export const useVsCodeApi = () => {
  const context = useContext(VsCodeApiContext);
  if (!context) {
    throw new Error('useVsCodeApi must be used within a VsCodeApiProvider');
  }
  return context;
};
