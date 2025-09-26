import { visit } from 'unist-util-visit';
import { getImageURL } from '../../extension/plugins/image/helpers';

export const rehypeAddDataId = (ids = [], className = '') => {
  return (tree) => {
    let index = 0;
    visit(tree, 'element', (node, _, parent) => {
      if (parent.type === 'root' && ids[index]) {
        node.properties['data-id'] = ids[index];
        node.properties.className = className;
        index++;
      }

      if (node.tagName === 'img' && node.properties?.src) {
        const oldSrc = node.properties.src;
        node.properties.src = getImageURL({ src: oldSrc });
      }
    });
  };
};
