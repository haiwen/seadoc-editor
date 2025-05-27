import React, { useContext, useEffect, useState } from 'react';
import context from '../context';
import { User } from '../model';

const CollaboratorsContext = React.createContext(null);

export const CollaboratorsProvider = ({ collaborators: propsCollaborators, children }) => {
  const isSdocRevision = context.getSetting('isSdocRevision');
  const isPublished = context.getSetting('isPublished');
  const [collaborators, setCollaborators] = useState(propsCollaborators || []);

  useEffect(() => {
    if (isSdocRevision && isPublished) return;
    if (propsCollaborators) return;
    context.listRelatedUsers().then(res => {
      const collaborators = [];
      res.data.related_users.forEach((user) => {
        const collaborator = new User(user);
        collaborators.push(collaborator);
      });
      setCollaborators(collaborators);
    }).catch(error => {
      // eslint-disable-next-line
      console.log(error);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Array.isArray(propsCollaborators) && propsCollaborators.length > 0) {
      setCollaborators(propsCollaborators);
    }
  }, [propsCollaborators]);

  return (
    <CollaboratorsContext.Provider value={{ collaborators }}>
      {children}
    </CollaboratorsContext.Provider>
  );
};

export const useCollaborators = () => {
  const context = useContext(CollaboratorsContext);
  if (!context) {
    throw new Error('\'CollaboratorsContext\' is null');
  }
  const { collaborators } = context;
  return { collaborators };
};
