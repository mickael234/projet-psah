import PDFDocument from "pdfkit"
import fs from 'fs';

/**
     * Génère un PDF contenant le rapport financier
     * @param {Array} transactions - Liste des paiements
     * @param {number} total - Total des paiements
     * @param {String} outputPath - Chemin du fichier PDF généré
     */

export function generateRapportPDF(transactions, total, outputPath){
    const doc = new PDFDocument();
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR');
    
    doc.pipe(fs.createWriteStream(outputPath));

    doc.fontSize(10).text(`${formattedDate}`, {
        align: 'right'
    });

    doc.fontSize(18).text('Rapport Financier', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Nombre de transactions : ${transactions.length}`);
    doc.text(`Total encaissé : ${total} €`);
    doc.moveDown();

    doc.fontSize(14).text('Détail des transactions :');
    doc.moveDown(0.5);

    transactions.forEach((transaction, index) => {
        const client = transaction.reservation?.client;
        const nomComplet = client ? `${client.prenom} ${client.nom}` : 'Client inconnu';
        doc
        .fontSize(12)
        .text(
            `${index + 1}. ${nomComplet} - ${transaction.montant} € - ${new Date(transaction.date_transaction).toLocaleDateString()}`
        );
    });

    doc.end();
}