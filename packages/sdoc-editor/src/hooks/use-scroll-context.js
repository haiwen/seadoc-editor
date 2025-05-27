import React, { useContext } from 'react';

export const ScrollContext = React.createContext(null);

export const useScrollContext = () => {
  const context = useContext(ScrollContext);

  if (!context) {
    throw new Error('The \`useScrollContext\` hook must be used inside the <ScrollContext> component\'s context.');
  }

  const { scrollRef } = context;
  return scrollRef;
};
