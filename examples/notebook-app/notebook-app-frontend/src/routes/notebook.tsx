import { useEffect, useState } from "react";
import { Notebook, useNotebooks } from "../state/appState";
import { useParams } from "react-router";
import Spinner from "../components/spinner";
import Card from "../components/card";
import FullScreenDiv from "../components/fullScreenDiv";



export default function NotebookView() {
    const {notebookId} = useParams();
    const [notebookInfo, setNotebookInfo] = useState<Notebook>();
    const [loading, setLoading] = useState(true);
    const { loadNotebookById } = useNotebooks();
    console.log(notebookId);

    useEffect(() => {
        (async function() {
            const notebookResult = await loadNotebookById(notebookId || '');
            if (notebookResult) {
                setNotebookInfo(notebookResult);
            }
            setLoading(false);
        })();
    }, []);

    if (loading) {
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
    if (!notebookInfo) {
        return <FullScreenDiv content={'An error occurred'} />;
    }
    return (
        <Card
            key={notebookInfo.id}
            name={notebookInfo.name}
            content={notebookInfo.content}
            href={`/notebooks/${notebookInfo.id}`}
        />
    )
}
