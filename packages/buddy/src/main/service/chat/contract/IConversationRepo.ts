export interface IConversationRepo {
  saveMessages(conversationId: string, messages: any): Promise<void>;
}
