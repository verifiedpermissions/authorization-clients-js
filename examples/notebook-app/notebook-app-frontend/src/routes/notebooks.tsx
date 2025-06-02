import { useNotebooks } from "../state/appState";
import Spinner from "../components/spinner";
import { useEffect } from "react";
import FullScreenDiv from "../components/fullScreenDiv";
import Card from "../components/card";


export default function Notebooks() {
    const {notebooksListState, loadNotebooks} = useNotebooks();
    console.log('rendering Notebooks')
    useEffect(() => {
        if ('loading' in notebooksListState) {
            loadNotebooks();
        }
    }, [notebooksListState]);

    if ('loading' in notebooksListState) {
        return (
            <Spinner
                type={'dual'}
                size={80}
                fullScreen
                thickness={3}
                color={'#2ecc71'}
            />
        );
    }
    if ('error' in notebooksListState) {
        return <FullScreenDiv content={notebooksListState.error} />;
    }
    console.log(notebooksListState);
    if (notebooksListState.notebooks.length === 0) {
        return <div>No notebooks found.</div>
    }
    return (
        <>
            {
                notebooksListState
                    .notebooks
                    .map(notebook => {
                        return (
                            <Card
                                key={notebook.id}
                                name={notebook.name}
                                content={notebook.content}
                                href={`/notebooks/${notebook.id}`}
                            />
                        )
                    })
            }
        </>
    )
}
