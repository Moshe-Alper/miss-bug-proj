const { useState } = React

export function BugFilter({ filterBy, onSetFilterBy }) {
    const [filter, setFilter] = useState(filterBy)

    function handleChange({ target }) {
        const { name, value } = target
        setFilter((prevFilter) => ({ ...prevFilter, [name]: value }))
    }

    function onFilter() {
        onSetFilterBy(filter)
    }

    return (
        <section className="bug-filter">
            <input
                type="text"
                name="txt"
                placeholder="Search bugs"
                value={filter.txt}
                onChange={handleChange}
            />
            <input
                type="number"
                name="minSeverity"
                placeholder="Minimum severity"
                value={filter.minSeverity}
                onChange={handleChange}
            />
            <button onClick={onFilter}>Filter</button>
        </section>
    )
}
