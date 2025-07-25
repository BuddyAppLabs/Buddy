export function useApp() {
  const isDev = import.meta.env.DEV;

  return {
    isDev,
  };
}
