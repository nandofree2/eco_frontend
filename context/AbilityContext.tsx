import React, { createContext } from 'react';
import { createContextualCan } from '@casl/react';
import { AppAbility, ability } from '../services/ability';

export const AbilityContext = createContext<AppAbility>(ability);
export const Can = createContextualCan(AbilityContext.Consumer);

export const AbilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};
