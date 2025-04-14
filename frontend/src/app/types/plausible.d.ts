interface Window {
    plausible?: (eventName: string, options?: { 
      callback?: VoidFunction; 
      props?: Record<string, string | number | boolean>;
    }) => void;
  }