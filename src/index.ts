import { AuthorizationRequest, AuthorizationResult, AuthorizationEngine, Entity } from "@cedar-policy/cedar-authorization";
import { VerifiedPermissionsClient, IsAuthorizedWithTokenCommand, Decision, VerifiedPermissionsClientConfig, IsAuthorizedCommand } from '@aws-sdk/client-verifiedpermissions';
import { AwsCredentialIdentity, AwsCredentialIdentityProvider } from "@aws-sdk/types";

type CallType = 'accessToken'|'identityToken'|'isAuthorized';

export interface AVPAuthorizerProps {
    policyStoreId: string;
    callType: CallType;
    credentials?: AwsCredentialIdentityProvider | AwsCredentialIdentity;
}

export class AVPAuthorizationEngine implements AuthorizationEngine {
    private readonly policyStoreId: string;
    private readonly callType: 'accessToken'|'identityToken'|'isAuthorized';
    private readonly avpClient: VerifiedPermissionsClient;
    constructor(props: AVPAuthorizerProps) {
        const {policyStoreId, callType, credentials} = props;
        if (!policyStoreId) {
            throw new Error ('PolicyStoreId must be specified');
        }
        this.policyStoreId = policyStoreId;

        const validCalltypes: CallType[] = ['accessToken','identityToken','isAuthorized']
        if (!validCalltypes.includes(callType)) {
            throw new Error(`Call type must be one of: ${validCalltypes.join(', ')}`);
        }
        this.callType = callType;

        const clientConfig: VerifiedPermissionsClientConfig = {
            customUserAgent: 'avp-integrations; avp-express/0.1', //TODO: un-hardcode version and add it at build time
        };
        
        if (credentials) {
            clientConfig.credentials = credentials;
        }

        this.avpClient = new VerifiedPermissionsClient(clientConfig);
    }
    
    async isAuthorized(request: AuthorizationRequest, entities: Entity[]): Promise<AuthorizationResult> {
        switch (this.callType){
            case 'isAuthorized': {
                const isAuthorizedParams = {
                    policyStoreId: this.policyStoreId,
                    principal: {
                        entityType: request.principal.type,
                        entityId: request.principal.id,
                    },
                    action: {
                        actionType: request.action.type,
                        actionId: request.action.id,
                    },
                    resource: {
                        entityType: request.resource.type,
                        entityId: request.resource.id,
                    },
                    context: {
                        cedarJson: JSON.stringify(request.context),
                    },
                    entities: {
                        cedarJson: JSON.stringify(entities)
                    }
                };
                try {
                    const isAuthorizedResponse = await this.avpClient.send(new IsAuthorizedCommand(isAuthorizedParams));
                    if (isAuthorizedResponse.decision === Decision.ALLOW) {
                        const determiningPolicies: string[] = (isAuthorizedResponse.determiningPolicies || [])
                            .map(dti => dti.policyId)
                            .filter(isNonNullable);
                        return {
                            type: 'allow',
                            authorizerInfo: {
                                principalUid: {
                                    type: request.principal.type,
                                    id: request.principal.id,
                                },
                                determiningPolicies,
                            }
                        };
                    } else {
                        return { type: 'deny' };
                    }
                } catch (e) {
                    return {type: 'error', message: `${e}`};
                }
            }
            case 'identityToken':
            case 'accessToken': {
                const isAuthorizedWithTokenParams = {
                    policyStoreId: this.policyStoreId,
                    [this.callType]: request.principal.id,
                    action: {
                        actionType: request.action.type,
                        actionId: request.action.id,
                    },
                    resource: {
                        entityType: request.resource.type,
                        entityId: request.resource.id,
                    },
                    context: {
                        cedarJson: JSON.stringify(request.context),
                    },
                    entities: {
                        cedarJson: JSON.stringify(entities)
                    }
                };
                try {
                    const isAuthorizedResponse = await this.avpClient.send(new IsAuthorizedWithTokenCommand(isAuthorizedWithTokenParams));
                    if (isAuthorizedResponse.decision === Decision.ALLOW) {
                        const determiningPolicies: string[] = (isAuthorizedResponse.determiningPolicies || [])
                            .map(dti => dti.policyId)
                            .filter(isNonNullable);
                        return {
                            type: 'allow',
                            authorizerInfo: {
                                principalUid: {
                                    type: `${isAuthorizedResponse.principal?.entityType}`,
                                    id: `${isAuthorizedResponse.principal?.entityId}`,
                                },
                                determiningPolicies,
                            }
                        };
                    } else {
                        return { type: 'deny' };
                    }
                } catch (e) {
                    return {type: 'error', message: `${e}`};
                }
            }
            default: {
                assertUnreachable(this.callType);
            }
        }
    }
}

function isNonNullable<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}
function assertUnreachable(_value: never): never {
    throw new Error('Statement should be unreachable');
}