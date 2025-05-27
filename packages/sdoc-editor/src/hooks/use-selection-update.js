import { useEffect, useState } from 'react';
import EventBus from '../utils/event-bus';

export default function useSelectionUpdate() {
  const [, update] = useState({});
  useEffect(() => {
    const onChange = () => update({});
    const eventBus = EventBus.getInstance();
    const unsubscribe = eventBus.subscribe('change', onChange);
    return () => {
      unsubscribe();
    };
  }, []);
}
