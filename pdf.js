export const PDFGen = {
    download(elementId, title) {
        const el = document.getElementById(elementId);
        if (!el) return;
        html2pdf().set({
            margin: 15, filename: `${title}_오답노트.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(el).save();
    }
};