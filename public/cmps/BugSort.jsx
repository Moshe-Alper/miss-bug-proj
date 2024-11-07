const { useState, useEffect } = React

export function BugSort({ onSetSort, sortBy }) {
    const [sortByToEdit, setSortByToEdit] = useState({ ...sortBy })

    useEffect(() => {
        onSetSort(sortByToEdit)
    }, [sortByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.type === 'number' ? +target.value : target.value
        setSortByToEdit(prevSort => ({
            ...prevSort,
            [field]: field === 'desc' ? -prevSort.desc : value
        }))
        
        // if (field === 'desc')
        //     setSortByToEdit(prevSort => ({
        //         ...prevSort,
        //         desc: -prevSort.desc,
        //     }))
        // else
        //     setSortByToEdit(prevSort => ({
        //         ...prevSort,
        //         [field]: value,
        //     }))
    }

    return (
        <form className="bug-sort">
            <select
                className="sort-type"
                name="type"
                value={sortByToEdit.type}
                onChange={handleChange}
            >
                <option value="title">Title</option>
                <option value="createdAt">Date</option>
                <option value="severity">Severity</option>
            </select>
            <label>
                <input
                    type="checkbox"
                    name="desc"
                    checked={sortByToEdit.desc < 0}
                    onChange={handleChange}
                />
                Descending
            </label>
        </form>
    )
}
