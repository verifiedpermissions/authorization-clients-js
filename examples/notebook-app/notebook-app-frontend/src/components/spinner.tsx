import './spinner.css';

export default function Spinner({
     type = 'circle',
     size = 40,
     thickness = 4,
     color = '#3498db',
     speed = 1,
     fullScreen = false
 }) {
    const style = {
        '--size': `${size}px`,
        '--thickness': `${thickness}px`,
        '--color': color,
        '--speed': `${speed}s`
    };

    return (
        <div className={`spinner-wrapper${fullScreen ? ' fullscreen' : ''}`}>
            {type === 'circle' && (
                <div className="spinner-circle" style={style}/>
            )}

            {type === 'dual' && (
                <div className="spinner-dual" style={style}/>
            )}

            {type === 'dots' && (
                <div className="spinner-dots" style={style}>
                    <div className="dot"/>
                    <div className="dot"/>
                    <div className="dot"/>
                </div>
            )}
        </div>
    );
};
