import { createContext, useContext, useState } from "react";
import { useAuth } from "react-oidc-context";

export interface Notebook {
    id: string;
    name: string;
    owner: string;
    content: string
}

type NotebooksListState =
{ loading: true } |
{ notebooks: Notebook[] } |
{ error: string };

interface NotebooksContextType {
    notebooksListState: NotebooksListState;
    setNotebooksList: (n: Notebook[]) => void;
    setNotebooksListError: (e: string) => void;
}

const NotebooksContext = createContext<NotebooksContextType | undefined>(undefined);

export function NotebooksProvider({ children }: { children: React.ReactNode }) {
    const [notebooksListState, setNotebooksListState] = useState<NotebooksListState>({
        loading: true
    });

    const value = {
        notebooksListState,
        setNotebooksList: (notebooks: Notebook[]) => {
            setNotebooksListState({notebooks});
        },
        setNotebooksListError: (error: string) => {
            setNotebooksListState({ error });
        },
    };

    return (
        <NotebooksContext.Provider value={value}>
            {children}
        </NotebooksContext.Provider>
    );
}

function getBaseApiUrl() {
    return 'http://localhost:3000';
}

export function useNotebooks() {
    const context = useContext(NotebooksContext);
    const auth = useAuth();
    if (context === undefined) {
        throw new Error('useNotebooks must be used within a NotebooksProvider');
    }
    const {
        notebooksListState,
        setNotebooksList,
        setNotebooksListError,
    } = context;

    const headers = () => {
        return {
            Authorization: `Bearer ${auth.user?.id_token}`,
        };
    };

    const loadNotebooks = async () => {
        const notebooksResult = await fetchJson<Notebook[]>('/notebooks', { headers: headers() });
        if (isApiError(notebooksResult)) {
            setNotebooksListError(notebooksResult.error);
            return;
        }
        setNotebooksList(notebooksResult);
    };

    const loadNotebookById = async (notebookId: string) => {
        const notebookResult = await fetchJson<Notebook>(`/notebooks/${notebookId}`, { headers: headers() });
        if (isApiError(notebookResult)) {
            alert("Error: " + notebookResult.error);
            return;
        }
        return notebookResult;
    };

    const createNotebook = async (name: string, content: string) => {
        const notebookResult = await fetchJson<Notebook>('/notebooks', {
            method: 'POST',
            headers: {
                ...headers(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, content }),
        });
        if (isApiError(notebookResult)) {
            alert("Error: " + notebookResult.error);
            return;
        }
        loadNotebooks();
        return notebookResult;
    
    }

    return {
        notebooksListState,
        loadNotebooks,
        loadNotebookById,
        createNotebook,
    };
}

interface ApiError {
    error: string;
    status: number;
}

function isApiError(result: any): result is ApiError {
    return 'error' in result && 'status' in result;
}

export async function fetchJson<TResponse>(relativeUrl: string, init: RequestInit): Promise<TResponse|ApiError> {
    const endpoint = getBaseApiUrl() + relativeUrl;
    const httpResponse = await fetch(endpoint, init);
    console.log('init', init);
    if (httpResponse.ok) {
        return httpResponse.json();
    }
    const errorResult: ApiError = {
        error: await httpResponse.text(),
        status: httpResponse.status,
    };
    return errorResult;
}
