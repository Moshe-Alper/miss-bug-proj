

export function BugPreview({ bug }) {

    return <article>
        {bug.labels && (
            <div className="bug-labels">
                {bug.labels.map((label, index) => (
                    <span key={index} className="label">{label}</span>
                ))}
            </div>
        )}
        <h4>{bug.title}</h4>
        <h1>🐛</h1>
        <p>Severity: <span>{bug.severity}</span></p>
        <p>{bug.description}</p>
    </article>
}