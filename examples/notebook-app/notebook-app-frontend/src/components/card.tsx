import { useNavigate } from "react-router";

interface CardProps {
    name: string;
    content: string;
    href: string;
}

export default function Card(props: CardProps) {
    const navigate = useNavigate();
    const cardStyle = {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        margin: '16px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        maxWidth: '300px',
    };

    const nameStyle = {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#333',
    };

    const contentStyle = {
        fontSize: '1rem',
        color: '#666',
        lineHeight: '1.5',
    };

    return (
        <div
            style={cardStyle}
            onClick={() => navigate(props.href)}
        >
            <h3 style={nameStyle}>{props.name}</h3>
            <p style={contentStyle}>{props.content}</p>
        </div>
    );
}
