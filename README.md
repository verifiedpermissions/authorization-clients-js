# Verified Permissions Authorization Clients

This package provides a TypeScript/JavaScript client for AWS Verified Permissions (AVP) that implements the Cedar Authorization Engine interface. For more information about the Cedar Authorization Engine, see [authorization-for-expressjs](https://github.com/cedar-policy/authorization-for-expressjs/).

## Overview

The `AVPAuthorizationEngine` class provides an implementation of the Cedar `AuthorizationEngine` interface that integrates with Cedar framework integrations. This package allows you to perform authorization checks using either the [IsAuthorized](https://docs.aws.amazon.com/verifiedpermissions/latest/apireference/API_IsAuthorized.html) or [IsAuthorizedWithToken](https://docs.aws.amazon.com/verifiedpermissions/latest/apireference/API_IsAuthorizedWithToken.html) AVP APIs.

## Installation

```bash
npm install @verifiedpermissions/authorization-clients-js
```

## Usage

### Basic Setup

```typescript
import { AVPAuthorizationEngine } from '@verifiedpermissions/authorization-clients-js';

const engine = new AVPAuthorizationEngine({
    policyStoreId: 'your-policy-store-id',
    callType: 'isAuthorized'
});
```

### Configuration Options

The `AVPAuthorizationEngine` constructor accepts the following properties:

- `policyStoreId` (required): The ID of your Amazon Verified Permissions policy store
- `callType` (required): The type of authorization call to make. Can be one of:
  - `'isAuthorized'`: Direct entity-based authorization (you need to handle authentication and pass a correct principal entity)
  - `'accessToken'`: IsAuthorizedWithToken using access tokens (You can pass an access token as the principal entity that will be used to call IsAuthorizedWithToken)
  - `'identityToken'`: IsAuthorizedWithToken using identity tokens (You can pass an identity token as the principal entity that will be used to call IsAuthorizedWithToken)
- `credentials` (optional): AWS credentials or credential provider for the Amazon Verified Permissions client

### Authorization Methods

#### Entity-Based Authorization

When using `callType: 'isAuthorized'`, the engine performs authorization checks by calling `IsAuthorized`:

```typescript
const request = {
    principal: { type: 'User', id: 'user123' },
    action: { type: 'Action', id: 'view' },
    resource: { type: 'Document', id: 'doc123' },
    context: { /* additional context */ }
};

const entities = [/* Cedar entities */];

const result = await engine.isAuthorized(request, entities);
```

#### Token-Based Authorization

When using `callType: 'accessToken'` or `'identityToken'`, the engine performs authorization by calling `IsAuthorizedWithToken`:

```typescript
const request = {
    principal: { type: 'Token', id: 'your-token' }, // Token goes in principal.id
    action: { type: 'Action', id: 'view' },
    resource: { type: 'Document', id: 'doc123' },
    context: { /* additional context */ }
};

const entities = [/* Cedar entities */];

const result = await engine.isAuthorized(request, entities);
```

### Authorization Results

Both APIs return a promise that resolves to an `AuthorizationResult`:

- Allow Result:
```typescript
{
    type: 'allow',
    authorizerInfo: {
        principalUid: {
            type: string,
            id: string
        },
        determiningPolicies: string[]
    }
}
```

- Deny Result:
```typescript
{
    type: 'deny'
}
```

- Error Result:
```typescript
{
    type: 'error',
    message: string
}
```

## Error Handling

The engine handles various error cases:
- Invalid policy store ID will throw an error during initialization
- Invalid call type will throw an error during initialization
- Authorization failures return a deny result
- Authorization errors (e.g., network issues, invalid tokens) return an error result

## Complete Example

Check out [express-petstore](https://github.com/verifiedpermissions/examples/tree/main/express-petstore) for a complete implementation of a protected API using this middleware.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.
