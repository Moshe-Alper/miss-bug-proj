const { useState, useEffect, useRef } = React

import { utilService } from "../services/util.service.js"

export function BugFilter({ filterBy, onSetFilterBy, availableLabels }) {
    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)
    const onSetFilterDebounce = useRef(utilService.debounce(onSetFilterBy, 1000))

    useEffect(() => {
        onSetFilterDebounce.current(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const { name, value, selectedOptions } = target
        let newValue = value

        switch (target.type) {
            case 'number':
                newValue = +value
                break
            case 'checkbox':
                newValue = target.checked
                break
            case 'select-multiple':
                newValue = Array.from(selectedOptions).map(option => option.value)
                break
            default:
                break
        }

        setFilterByToEdit((prevFilter) => ({ ...prevFilter, [name]: newValue }))
    }
// console.log('filterByToEdit:', filterBy)
    return (
        <section className="bug-filter">
            <input
                type="text"
                name="txt"
                placeholder="Search bugs"
                value={filterByToEdit.txt}
                onChange={handleChange}
            />
            <input
                type="number"
                name="severity"
                placeholder="Minimum severity"
                value={filterByToEdit.severity}
                onChange={handleChange}
            />
            <select
                name="labels"
                multiple
                value={filterByToEdit.labels}
                onChange={handleChange}
            >
                {availableLabels.map(label => (
                    <option key={label} value={label}>
                        {label}
                    </option>
                ))}
            </select>
        </section>
    )
}
