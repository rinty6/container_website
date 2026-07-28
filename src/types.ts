// Define ojects and their properties. Each property has its own data type
// This will help us prevent type error

export interface Template {
    id: string;
     name: string;
     image: string;
    description: string | null; 
};

export type SandboxStatus =
  | 'REQUESTED'
  | 'PROVISIONING'
  | 'RUNNING'
  | 'FAILED'
  | 'EXPIRED'
  | 'DESTROYED';

export interface SandboxEvent {
  id: string;
  type: string;
  message: string | null;
  timestamp: string;
}

export interface Sandbox {
  id: string;
  name: string;
  template: Template;
  status: SandboxStatus;
  railwayServiceId: string | null;
  createdAt: string;
  expiresAt: string;
  events: SandboxEvent[];
}

export type PanelId = 'guide' | 'feedback' | 'profile' | 'import';