import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugSort } from '../cmps/BugSort.jsx'

const { useState, useEffect } = React

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

    const availableLabels = ['critical', 'need-CR', 'dev-branch', 'frontend', 'urgent', 'UI-issue', 'backend', 'low-priority']

    useEffect(() => {
        loadBugs()
    }, [filterBy])

    function loadBugs() {
        bugService
            .query(filterBy)
            .then(setBugs)
            .catch((err) => {
                showErrorMsg('Cannot load bugs...')
                console.error(err)
            })
    }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                console.log('Deleted Succesfully!')
                const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?'),
            severity: +prompt('Bug severity?'),
            description: prompt('Add description'),
            labels: getLabels(),
        }
        bugService
            .save(bug)
            .then((savedBug) => {
                console.log('Added Bug', savedBug)
                setBugs([...bugs, savedBug])
                loadBugs()
                showSuccessMsg('Bug added')
            })
            .catch((err) => {
                console.log('Error from onAddBug ->', err)
                showErrorMsg('Cannot add bug')
            })
    }

    function onEditBug(bug) {
        const title = prompt('New Title?')
        const severity = +prompt('New severity?')
        const description = prompt('Edit description')
        const bugToSave = { ...bug, title, severity, description }
        bugService
            .save(bugToSave)
            .then((savedBug) => {
                console.log('Updated Bug:', savedBug)
                const bugsToUpdate = bugs.map((currBug) =>
                    currBug._id === savedBug._id ? savedBug : currBug
                )
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch((err) => {
                console.log('Error from onEditBug ->', err)
                showErrorMsg('Cannot update bug')
            })
    }

    function onSetFilterBy(newFilter) {
        setFilterBy(newFilter)
    }

    function onSetSort(sortBy) {
        setFilterBy(prevFilter => ({
            ...prevFilter,
            sortBy: { ...prevFilter.sortBy, ...sortBy }
        }))
    }

    function onChangePageIdx(diff) {
        setFilterBy(prevFilter => ({ ...prevFilter, pageIdx: prevFilter.pageIdx + diff }))
    }

    function onDownloadPdf() {
        window.open('/pdf', '_blank');
    }

    function getLabels() {
        const labels = [];
        while (labels.length < 3) {
            const label = prompt(`Enter label ${labels.length + 1} (you need ${3 - labels.length} more):`)
            if (label) {
                labels.push(label)
            } else {
                alert('Label cannot be empty. Please enter a valid label.')
            }
        }
        return labels
    }

    return (
        <main>
            <section className='info-actions'>
                <h3>Bugs App</h3>
                <button className='action-btn' onClick={onAddBug}>Add Bug ⛐</button>
                <button className='action-btn' onClick={onDownloadPdf}>Download PDF</button>
                <BugFilter
                    filterBy={filterBy}
                    onSetFilterBy={onSetFilterBy}
                    availableLabels={availableLabels}
                />
                <BugSort
                    onSetSort={onSetSort}
                    sortBy={{ ...filterBy.sortBy }}
                />

            </section>
            <main>
                <div className="pagination-section">
                    <button className='action-btn' onClick={() => { onChangePageIdx(1) }}>+</button>
                    {filterBy.pageIdx + 1 || ''}
                    <button className='action-btn' onClick={() => { onChangePageIdx(-1) }} disabled={filterBy.pageIdx === 0}>-</button>
                </div>
                <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
            </main>
        </main>
    )
}
