export const useMockApi = () => import.meta.env.VITE_USE_MOCK_API === 'true';

export const getMockDelay = () => {
  const raw = Number(import.meta.env.VITE_MOCK_DELAY_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : 600;
};

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
