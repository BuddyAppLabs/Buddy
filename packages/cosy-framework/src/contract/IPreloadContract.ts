/**
 * Preload script contract
 * Defines the shape of the API exposed from the preload script to the renderer process.
 */
import { IpcResponse } from '@coffic/buddy-types';

export interface IPreloadApi {
  /**
   * Send a message to the main process
   * @param channel The channel to send the message on
   * @param args The arguments to send
   */
  send: (channel: string, ...args: unknown[]) => void;

  /**
   * Receive a message from the main process
   * @param channel The channel to receive the message on
   * @param callback The callback to execute when a message is received
   */
  receive: (channel: string, callback: (...args: unknown[]) => void) => void;

  /**
   * Remove a listener for a message from the main process
   * @param channel The channel to remove the listener from
   * @param callback The callback to remove
   */
  removeListener: (
    channel: string,
    callback: (...args: unknown[]) => void
  ) => void;

  /**
   * Send a message to the main process and wait for a response
   * @param channel The channel to send the message on
   * @param args The arguments to send
   * @returns A promise that resolves with the response from the main process
   */
  invoke: (channel: string, ...args: unknown[]) => Promise<IpcResponse<any>>;
}
