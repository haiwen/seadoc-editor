import context from '../../../context';

export const addDataToTree = (treeData, indexId, childrenData, path) => {
  for (let i = 0; i < treeData.length; i ++) {
    if (treeData[i].indexId === indexId) {
      treeData[i].children = childrenData;
      treeData[i].children.forEach((child) => {
        child.path = path + `/${child.name}`;
      });
      break;
    }

    if (treeData[i]?.children) {
      addDataToTree(treeData[i]?.children, indexId, childrenData, path);
    }
  }
  return treeData;
};

export const getSdocFileIcon = () => {
  const server = context.getSetting('serviceUrl');
  return `${server}/media/img/file/256/sdoc.png`;
};

export const getVideoFileIcon = () => {
  const server = context.getSetting('serviceUrl');
  return `${server}/media/img/file/256/video.png`;
};
