import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { AVPAuthorizationEngine } from '../src';
import {
    VerifiedPermissionsClient,
    CreatePolicyStoreCommand,
    DeletePolicyStoreCommand,
    CreatePolicyCommand,
} from '@aws-sdk/client-verifiedpermissions';
import { AuthorizationResult } from '@cedar-policy/cedar-authorization';

describe('AVPAuthorizationEngine Tests', () => {
    let policyStoreId: string;
    let avpClient: VerifiedPermissionsClient;
    let engine: AVPAuthorizationEngine;

    beforeAll(async () => {
        // Create a new AVP client
        avpClient = new VerifiedPermissionsClient();

        console.log('Creating PS...');
        const createPolicyStoreResponse = await avpClient.send(new CreatePolicyStoreCommand({
            validationSettings: {
                mode: 'OFF'
            }
        }));

        if (!createPolicyStoreResponse.policyStoreId) {
            throw new Error('Failed to create policy store');
        }

        policyStoreId = createPolicyStoreResponse.policyStoreId;
        console.log('Created PS:', policyStoreId);

        // Create an AVPAuthorizationEngine with the policy store ID
        engine = new AVPAuthorizationEngine({
            policyStoreId,
            callType: 'isAuthorized'
        });
    });

    afterAll(async () => {
        if (policyStoreId) {
            await avpClient.send(new DeletePolicyStoreCommand({
                policyStoreId
            }));
            console.log('Deleted PS:', policyStoreId);
        }
    });

    test('should return deny when no policies exist', async () => {
        const request = {
            principal: { type: 'User', id: 'alice' },
            action: { type: 'Action', id: 'view' },
            resource: { type: 'Document', id: 'doc123' },
            context: {}
        };

        const result = await waitForDecision(
            () => engine.isAuthorized(request, []),
            'deny'
        );

        expect(result.type).toBe('deny');
    });

    test('should return allow after creating a permissive policy', async () => {
        await avpClient.send(new CreatePolicyCommand({
            policyStoreId,
            definition: {
                static: {
                    description: 'Permit everything',
                    statement: 'permit(principal,action,resource);'
                }
            },
        }));

        const request = {
            principal: { type: 'User', id: 'bob' },
            action: { type: 'Action', id: 'read' },
            resource: { type: 'Document', id: 'doc456' },
            context: {}
        };

        const result = await waitForDecision(
            () => engine.isAuthorized(request, []),
            'allow'
        );

        expect(result.type).toBe('allow');
        expect(result).toHaveProperty('authorizerInfo');
        if (result.type === 'allow') {
            expect(result.authorizerInfo.principalUid).toEqual({
                type: 'User',
                id: 'bob'
            });
            expect(Array.isArray(result.authorizerInfo.determiningPolicies)).toBe(true);
        }
    });
});

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForDecision(
    call: () => Promise<AuthorizationResult>,
    decision: AuthorizationResult['type']
): Promise<AuthorizationResult> {
    let result: AuthorizationResult = { type: 'deny' };
    let attempts = 0;
    const maxAttempts = 10;

    while (result.type !== decision && attempts < maxAttempts) {
        await wait(2000);

        result = await call();
        attempts++;
    }
    return result;
}
