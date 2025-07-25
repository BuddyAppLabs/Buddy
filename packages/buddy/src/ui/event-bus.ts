import mitt from 'mitt';
export const eventBus = mitt<{ key: string; showKey: string }>();
