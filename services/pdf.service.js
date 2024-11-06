import PDFDocument from 'pdfkit-table'
import fs from 'fs'
export const pdfService = {
    createPdf
}

function createPdf({ headers, rows, title = 'Table Title', subtitle = 'Some sub title', fileName = 'document' }) {
    const doc = new PDFDocument({ margin: 30, size: 'A4' })
    doc.pipe(fs.createWriteStream(`./pdfs/${fileName}.pdf`));


    const table = {
        title,
        subtitle,
        headers,
        rows
    }

    return doc.table(table).then(() => { doc.end() }).catch((err) => { })
}