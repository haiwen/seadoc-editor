import { IMAGE, IMAGE_BLOCK, PARAGRAPH, VIDEO } from '../../constants';

export const saveSdocToken = (docUuid, token) => {
  const now = Date.now();
  // 3 days is the valid time token set by back-end
  const expireTime = now + 3 * 24 * 60 * 60 * 1000;

  localStorage.setItem(`access_token_${docUuid}`, token);
  localStorage.setItem(`access_token_${docUuid}_expire`, expireTime.toString());
};

export const getSdocToken = (docUuid) => {
  const token = localStorage.getItem(`access_token_${docUuid}`);
  const expire = localStorage.getItem(`access_token_${docUuid}_expire`);

  if (!token || !expire) return null;

  if (Date.now() > parseInt(expire)) {
    localStorage.removeItem(`access_token_${docUuid}`);
    localStorage.removeItem(`access_token_${docUuid}_expire`);
    return null;
  }

  return token;
};

export const attachDocUuidToResources = (elements, docUuid) => {
  return elements.map(el => {
    if ([IMAGE_BLOCK, PARAGRAPH].includes(el.type) && el.children?.length > 1) {
      const newChildren = el.children.map(child => {
        if (child.type === IMAGE) {
          return {
            ...child,
            data: {
              ...child.data,
              owner_docUuid: docUuid,
            }
          };
        } else {
          return child;
        }
      });

      return {
        ...el,
        children: newChildren,
      };
    }

    if (el.type === VIDEO) {
      return {
        ...el,
        data: {
          ...el.data,
          owner_docUuid: docUuid,
        }
      };
    }

    return el;
  });
};
