const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const { VerifiedPermissionsClient, ListPoliciesCommand } = require("@aws-sdk/client-verifiedpermissions");
const { notebooksRepository } = require('./notebookRepository');
const verifyToken = require('./middleware/authMiddleware');
const oaig = require('express-openapi-generator');
const { ExpressAuthorizationMiddleware } = require('@cedar-policy/authorization-for-expressjs');
const { type } = require('os');
const { AVPAuthorizationEngine } = require('@verifiedpermissions/authorization-clients');

const documentBuilder = oaig.DocumentBuilder.initializeDocument({
    openapi: '3.0.1',
    info: {
        title: 'A example document',
        version: '1',
    },
    paths: {}, // You don't need to include any path objects, those will be generated later
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const allowedOrigin = 'http://localhost:5173'; // set this differently depending on env
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const avpAuthorizationEngine = new AVPAuthorizationEngine({
    policyStoreId: process.env.POLICY_STORE_ID,
    callType: 'identityToken'
});

const expressAuthorization = new ExpressAuthorizationMiddleware({
    schema: {
        type: 'jsonString',
        schema: fs.readFileSync(path.join(__dirname, 'v4.cedarschema.json'), 'utf8'),
    },
    authorizationEngine: avpAuthorizationEngine,
    principalConfiguration: { type: 'identityToken' },
    skippedEndpoints: [
        { httpVerb: 'get', path: '/login' },
        { httpVerb: 'get', path: '/api-spec/v3' },
        { httpVerb: 'get', path: '/notebooks/:id' },
        { httpVerb: 'put', path: '/notebooks/:id' },
        { httpVerb: 'delete', path: '/notebooks/:id' },
    ],
    logger: {
        debug: s => console.log(s),
        log: s => console.log(s),
    }
});

// Apply the JWT verification middleware to protected routes
app.use(verifyToken);

app.use(expressAuthorization.middleware);

app.get('/notebooks', async (req, res) => {
    const principalSub = req.user.sub; // Use the sub from the verified JWT
    const notebooks = await notebooksRepository.findByOwner(principalSub);
    res.json(notebooks);
});

app.post('/notebooks', (req, res) => {
    const principalSub = req.user.sub; // Use the sub from the verified JWT
    const id = Date.now().toString();
    console.log('received body', req.body);
    const notebook = {
        id,
        name: req.body.name,
        owner: principalSub,
        content: req.body.content
    };
    notebooksRepository.saveNotebook(notebook);
    console.log(notebooksRepository.findById(id));
    res.status(201).json(notebook);
});

const notebookSchema = {
    title: 'A notebook object',
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        owner: { type: 'string' },
        content: { type: 'string' },
        public: { type: 'boolean' },
    },
    required: ['id', 'name', 'owner', 'content'],
};
const NOTEBOOK = 'Notebook';
documentBuilder.schema(NOTEBOOK, { component: notebookSchema });

const getNotebookByIdOperation = {
    operationId: 'getNotebookById',
    'x-cedar': {
        appliesToResourceTypes: [NOTEBOOK]
    },
    responses: {
        '200': {
            description: 'Get notebook by id',
            content: {
                'application/json': {
                    schema: documentBuilder.schema(NOTEBOOK),
                },
            },
        },
    },
};
app.get('/notebooks/:id',
    oaig.PathMiddleware.path('getNotebookById', { operationObject: getNotebookByIdOperation }),
    expressAuthorization.handlerSpecificMiddleware({
        resourceProvider: async req => {
            const notebook = await notebooksRepository.findById(req.params.id);
            return {
                uid: {
                    type: 'NotebooksApp::Notebook',
                    id: req.params.id
                },
                attrs: notebook,
                parents: [],
            }
        }
    }),
    async function getNotebookById(req, res) {
        console.log(req.params);
        const notebook = await notebooksRepository.findById(req.params.id);
        if (notebook) {
            res.json(notebook);
        } else {
            res.status(404).send('Notebook not found');
        }
    });

const putNotebookOperation = {
    operationId: 'putNotebook',
    'x-cedar': {
        appliesToResourceTypes: [NOTEBOOK]
    },
    responses: {
        '200': {
            description: 'Put notebook',
            content: {
                'application/json': {
                    schema: documentBuilder.schema(NOTEBOOK),
                },
            },
        },
    },
};
app.put(
    '/notebooks/:id',
    oaig.PathMiddleware.path('putNotebook', { operationObject: putNotebookOperation }),
    expressAuthorization.handlerSpecificMiddleware({
        resourceProvider: async req => {
            const notebook = await notebooksRepository.findById(req.params.id);
            return {
                uid: {
                    type: 'NotebooksApp::Notebook',
                    id: req.params.id
                },
                attrs: notebook,
                parents: [],
            }
        }
    }),
    async (req, res) => {
        const notebook = await notebooksRepository.putNotebook(req.params.id, req.body);
        if (notebook) {
            res.json(notebook);
        } else {
            res.status(404).send('Notebook not found');
        }
    });

const deleteNotebookOperation = {
    operationId: 'deleteNotebook',
    'x-cedar': {
        appliesToResourceTypes: [NOTEBOOK]
    }
};

app.delete(
    '/notebooks/:id',
    oaig.PathMiddleware.path('deleteNotebook', { operationObject: deleteNotebookOperation }),
    expressAuthorization.handlerSpecificMiddleware({
        resourceProvider: async req => {
            const notebook = await notebooksRepository.findById(req.params.id);
            return {
                uid: {
                    type: 'NotebooksApp::Notebook',
                    id: req.params.id
                },
                attrs: notebook,
                parents: [],
            }
        }
    }),
    async (req, res) => {
        await notebooksRepository.deleteNotebook(req.params.id);
        res.status(200).send('Ok');
    });

// Configure AWS SDK v3
const verifiedPermissionsClient = new VerifiedPermissionsClient();

app.get('/notebooks/shared-with-me', async (req, res) => {
    try {
        const userId = req.user.sub; // Use the sub from the verified JWT

        const params = {
            policyStoreId: process.env.POLICY_STORE_ID,
            maxResults: 20,
            filter: {
                principal: {
                    identifier: {
                        entityType: 'NotebooksApp::User',
                        entityId: userId
                    }
                }
            }
        };

        const command = new ListPoliciesCommand(params);
        const response = await verifiedPermissionsClient.send(command);
        const resourceIds = response.policies.map(policy => policy.resource);

        res.json(resourceIds);
    } catch (error) {
        console.error('Error fetching shared notebooks:', error);
        res.status(500).send('Internal server error');
    }
});


documentBuilder.generatePathsObject(app);

console.log(JSON.stringify(documentBuilder.build(), null, 4));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});