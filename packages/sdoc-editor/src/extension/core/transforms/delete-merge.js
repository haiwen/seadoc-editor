import { Editor, Element, Path, Point, Range, Transforms } from '@seafile/slate';

/**
 *
 * @param {*} editor
 * @param {*} options { at, distance, hanging, reverse, test, unit, voids }
 */
export const deleteMerge = (editor, options = {}) => {
  Editor.withoutNormalizing(editor, () => {
    const {
      distance = 1,
      reverse = false,
      unit = 'character',
      voids = false,
    } = options;
    let { at = editor.selection, hanging = false } = options;
    if (!at) {
      return;
    }

    if (Range.isRange(at) && Range.isCollapsed(at)) {
      at = at.anchor;
    }

    if (Point.isPoint(at)) {
      const furthestVoid = Editor.void(editor, { at, mode: 'highest' });
      if (!voids && furthestVoid) {
        const [, voidPath] = furthestVoid;
        at = voidPath;
      } else {
        const opts = { distance, unit };
        const target = reverse
          ? Editor.before(editor, at, opts) || Editor.start(editor, [])
          : Editor.after(editor, at.opts) || Editor.end(editor, []);
        at = { anchor: at, focus: target };
        hanging = true;
      }
    }

    if (Path.isPath(at)) {
      Transforms.removeNodes(editor, at, { voids });
      return;
    }

    if (Range.isCollapsed(at)) {
      return;
    }

    if (!hanging) {
      at = Editor.unhangRange(editor, at, { voids });
    }

    let [start, end] = Range.edges(at);
    const startBlock = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      at: start,
      voids,
    });
    const endBlock = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      at: end,
      voids,
    });

    const isAcrossBlocks = startBlock && endBlock && !Path.equals(startBlock[1], endBlock[1]);
    const isSingleText = Path.equals(start.path, end.path);
    const startVoid = voids ? null : Editor.void(editor, { at: start, mode: 'highest' });
    const endVoid = voids ? null : Editor.void(editor, { at: end, mode: 'highest' });

    if (startVoid) {
      const before = Editor.before(editor, start);
      if (before && startBlock && Path.isAncestor(startBlock[1], before.path)) {
        start = before;
      }
    }

    if (endVoid) {
      const after = Editor.after(editor, end);
      if (after && endVoid && Path.isAncestor(endBlock[1], after.path)) {
        end = after;
      }
    }

    const matches = [];
    let lastPath = undefined;
    const _nodes = Editor.nodes(editor, { at, voids });
    for (const entry of _nodes) {
      const [node, path] = entry;
      if (lastPath && Path.compare(path, lastPath) === 0) {
        continue;
      }

      if ((!voids && Editor.isVoid(editor, node)) || (!Path.isCommon(path, start.path) && !Path.isCommon(path, end.path))){
        matches.push(entry);
        lastPath = path;
      }
    }

    const pathRefs = Array.from(matches, ([, p]) => Editor.pathRef(editor, p));

    const startRef = Editor.pointRef(editor, start);
    const endRef = Editor.pointRef(editor, end);

    if (!isSingleText && !startVoid) {
      const point = startRef.current;
      const [node] = Editor.leaf(editor, point);
      const { path } = point;
      const { offset } = start;
      const text = node.text.slice(offset);
      editor.apply({ type: 'remove_text', path, offset, text });
    }

    for (const pathRef of pathRefs) {
      const path = pathRef.unref();
      Transforms.removeNodes(editor, { at: path, voids });
    }

    if (!endVoid) {
      const point = endRef.current;
      const [node] = Editor.leaf(editor, point);
      const { path } = point;
      const offset = isSingleText ? start.offset : 0;
      const text = node.text.slice(offset, end.offset);
      editor.apply({ offset, path, text, type: 'remove_text' });
    }

    if (!isSingleText && isAcrossBlocks && endRef.current && start.current) {
      Transforms.mergeNodes(editor, { at: endRef.current, hanging: true, voids });
    }

    const point = endRef.unref() || startRef.unref();

    if (options.at == null && point) {
      Transforms.select(editor, point);
    }
  });


};
