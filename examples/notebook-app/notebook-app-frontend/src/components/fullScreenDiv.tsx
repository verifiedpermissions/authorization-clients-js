export default function FullScreenDiv(props: {content: string}) {
    return (
        <div style={{
            display: 'flex',
            margin: '0 auto',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '90vh',
        }}>
            {props.content}
        </div>
    );
}
