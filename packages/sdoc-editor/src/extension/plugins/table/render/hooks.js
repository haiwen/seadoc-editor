import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useScrollContext } from '../../../../hooks/use-scroll-context';

export const TableRootContext = createContext();

export const useTableRootContext = () => {
  return useContext(TableRootContext);
};

export const TableSelectedRangeContext = createContext();

export const useTableSelectedRangeContext = () => {
  return useContext(TableSelectedRangeContext);
};

export const ResizeHandlersContext = createContext();

export const useResizeHandlersContext = () => {
  return useContext(ResizeHandlersContext);
};

export const SettingSelectRangeContext = createContext();

export const useSettingSelectRangeContext = () => {
  return useContext(SettingSelectRangeContext);
};

export const TableRootScrollLeftContext = createContext();

export const useTableRootScrollLeftContext = () => {
  return useContext(TableRootScrollLeftContext);
};

export const useContextMenu = (tableScrollWrapper) => {

  const scrollRef = useScrollContext();
  const [isShowContextMenu, setShowContextMenu] = useState();
  const [menuPosition, setMenuPosition] = useState({});

  const onContextMenu = useCallback((event) => {
    event.preventDefault();
    const menuPosition = {
      left: event.clientX,
      top: event.clientY
    };
    setShowContextMenu(true);
    setMenuPosition(menuPosition);
  }, []);

  const hideContextMenu = useCallback((e) => {
    if (isShowContextMenu) {
      setShowContextMenu(false);
    }
  }, [isShowContextMenu]);

  const hideByContextmenuEvent = useCallback((e) => {
    const table = tableScrollWrapper.current;
    const clickIsInCurrentTable = table && table.contains(e.target) && table !== e.target;
    if (!clickIsInCurrentTable) {
      setShowContextMenu(false);
    }
  }, [tableScrollWrapper]);

  useEffect(() => {
    document.addEventListener('mousedown', hideContextMenu);
    document.addEventListener('contextmenu', hideByContextmenuEvent, true);
    scrollRef.current && scrollRef.current.addEventListener('scroll', hideContextMenu);
    return () => {
      document.removeEventListener('mousedown', hideContextMenu);
      document.removeEventListener('contextmenu', hideByContextmenuEvent, true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      scrollRef.current && scrollRef.current.removeEventListener('scroll', hideContextMenu);
    };
  }, [hideContextMenu, hideByContextmenuEvent, scrollRef]);

  return {
    isShowContextMenu,
    menuPosition,
    onContextMenu,
  };

};
