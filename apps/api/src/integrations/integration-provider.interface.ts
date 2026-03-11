export interface IntegrationProvider {
  name: string;
  isEnabled(): boolean;
  syncIssue?(issueId: string): Promise<void>;
  syncEmailResponse?(emailResponseId: string): Promise<void>;
  notifyAssignment?(
    userId: string,
    entityType: 'issue' | 'emailResponse',
    entityId: string,
  ): Promise<void>;
}
