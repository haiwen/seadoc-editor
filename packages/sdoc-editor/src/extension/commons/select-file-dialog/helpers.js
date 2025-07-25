import context from '../../../context';
import { FILEEXT_TYPE, FILEEXT_TYPE_MAP } from '../../constants';

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

export const whiteboardFileIcon = () => {
  const server = context.getSetting('serviceUrl');
  return `${server}/media/img/file/256/draw.png`;
};

export const getFileTypeIcon = (fileType) => {
  const imgResource = ['css', 'draw', 'excel', 'md', 'music', 'pdf', 'pic', 'ppt', 'psd', 'sdoc', 'txt', 'video', 'zip', 'word'];
  if (imgResource.includes(fileType)) {
    const server = context.getSetting('serviceUrl');
    return `${server}/media/img/file/256/${fileType}.png`;
  } else {
    return false;
  }
};

export const parcelFileTypeIcon = (fileName) => {
  const newFileType = fileName.split('.').pop();
  const fileExtType = Object.entries(FILEEXT_TYPE).find(([, extensions]) => extensions.includes(newFileType))?.[0];
  const fileTypeResult = fileExtType ? FILEEXT_TYPE_MAP[fileExtType] : newFileType;
  const fileTypeIcon = getFileTypeIcon(fileTypeResult);
  return fileTypeIcon;
};
