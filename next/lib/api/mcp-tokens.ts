import { apiCall } from './client';
import type { DataEnvelope, McpToken, McpTokenCreated } from '@/lib/api/types';

const RESOURCE_MCP_TOKENS = '/api/mcp-tokens';

export async function listMcpTokens(): Promise<McpToken[]> {
  const body = await apiCall<DataEnvelope<McpToken[]>>(
    'GET',
    RESOURCE_MCP_TOKENS,
  );
  return body.data;
}

export async function createMcpToken(name: string): Promise<McpTokenCreated> {
  const body = await apiCall<DataEnvelope<McpTokenCreated>>(
    'POST',
    RESOURCE_MCP_TOKENS,
    { data: { name } },
  );
  return body.data;
}

export async function revokeMcpToken(id: number): Promise<void> {
  await apiCall<void>('DELETE', `${RESOURCE_MCP_TOKENS}/${id}`);
}
