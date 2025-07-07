import mitt from 'mitt';
export const eventBus = mitt<{ globalKey: string; showKey: string }>();
