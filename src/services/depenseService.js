import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import ValidationService from './validationService.js';
import DepenseModel from '../models/depense.model.js';


class DepenseService {
    /**
     * Génère un rapport financier PDF pour une période spécifique
     * @param {Request} req - Requête Express
     * @param {Response} res - Réponse Express
     * @returns {Response} - Flux de données PDF ou message d'erreur
     */
    static async generateFinancialReport(req, res) {
        try {
            // Utilisation du service de validation pour éviter la duplication de code
            const validationResult = ValidationService.validateDatePeriod(req.query);
            
            // Si la validation échoue, retourne l'erreur
            if (validationResult.error) {
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: validationResult.message
                });
            }
            
            // Récupération des dates validées
            const { dateDebutObj, dateFinObj } = validationResult;
            const { dateDebut, dateFin } = req.query;
            
            // Récupération des données financières
            const financialData = await DepenseModel.findByPeriod(dateDebutObj, dateFinObj);
            
            // Vérification que des données ont été trouvées
            if (!financialData || 
                (!financialData.resume?.totalRevenus && !financialData.resume?.totalDepenses) ||
                (financialData.details?.paiements.length === 0 && financialData.details?.depenses.length === 0)) {
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucune transaction n'a été trouvée pendant cette période."
                });
            }
            
            // Formatage de la période pour l'affichage avec le service de validation
            const periode = ValidationService.formatPeriode(financialData.periode);
            
            // Créer le fichier PDF
            const doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50
                },
                info: {
                    Title: `Rapport Financier - ${periode.texte}`,
                    Author: 'Système de gestion financière',
                    Subject: 'Rapport Financier',
                    Keywords: 'finances, rapport, revenus, dépenses'
                }
            });
            
            // Définir l'en-tête de la réponse pour le téléchargement du PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=rapport-financier-${dateDebut}-${dateFin}.pdf`);
            
            // Diriger le flux PDF vers la réponse HTTP
            doc.pipe(res);
            
            // Générer le contenu du rapport PDF
            this.buildPdfContent(doc, financialData, periode);
            
            // Finaliser le document et envoyer la réponse
            doc.end();
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Erreur lors de la génération du rapport financier.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    /**
     * Construit le contenu du document PDF avec les données financières
     * @param {PDFKit.PDFDocument} doc - Document PDF
     * @param {Object} data - Données financières
     * @param {Object} periode - Informations sur la période
     */
    static buildPdfContent(doc, data, periode) {
        // Couleurs utilisées dans le document
        const colors = {
            primary: '#3366cc',
            secondary: '#99ccff',
            revenue: '#33cc33',
            expense: '#ff3333',
            text: '#333333',
            lightGray: '#f2f2f2',
            border: '#cccccc'
        };
        
        // Police par défaut
        doc.font('Helvetica');
        
        // En-tête du document
        doc.fontSize(24)
           .fillColor(colors.primary)
           .text('RAPPORT FINANCIER', { align: 'center' })
           .moveDown(0.5);
        
        doc.fontSize(16)
           .fillColor(colors.primary)
           .text(periode.texte, { align: 'center' })
           .moveDown(1);
           
        // Informations générales
        doc.fontSize(12)
           .fillColor(colors.text)
           .text(`Nombre de jours: ${periode.nbJours}`, { align: 'center' })
           .moveDown(2);
        
        // Résumé financier
        this.addSummarySection(doc, data.resume, colors);
        
        // Détails des transactions
        this.addTransactionsSection(doc, data.details, colors);
        
        // Pied de page
        const bottomOfPage = doc.page.height - doc.page.margins.bottom;
        doc.fontSize(8)
           .fillColor(colors.text)
           .text(
               `Document généré le ${new Date().toLocaleDateString('fr-FR', { 
                   day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
               })}`,
               doc.page.margins.left,
               bottomOfPage - 20,
               { align: 'center' }
           );
    }
    
    /**
     * Ajoute la section de résumé financier au document
     * @param {PDFKit.PDFDocument} doc - Document PDF
     * @param {Object} resume - Données de résumé financier
     * @param {Object} colors - Couleurs du document
     */
    static addSummarySection(doc, resume, colors) {
        // Titre de la section
        doc.fontSize(16)
           .fillColor(colors.primary)
           .text('Résumé Financier', { align: 'left', underline: true })
           .moveDown(1);
        
        // Tableau de résumé
        const tableTop = doc.y;
        const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const rowHeight = 30;
        
        // En-tête du tableau
        doc.fillColor(colors.primary)
           .rect(doc.page.margins.left, tableTop, tableWidth, rowHeight)
           .fill();
        
        doc.fillColor('#ffffff')
           .fontSize(12)
           .text('Catégorie', doc.page.margins.left + 10, tableTop + 10, { align: 'left' })
           .text('Montant', doc.page.margins.left + 300, tableTop + 10, { width: 100, align: 'right' });
        
        // Ligne des revenus
        const revenueTop = tableTop + rowHeight;
        doc.fillColor(colors.lightGray)
           .rect(doc.page.margins.left, revenueTop, tableWidth, rowHeight)
           .fill();
        
        doc.fillColor(colors.text)
           .text('Total des revenus', doc.page.margins.left + 10, revenueTop + 10, { align: 'left' })
           .fillColor(colors.revenue)
           .text(`${resume.totalRevenus.toFixed(2)} €`, doc.page.margins.left + 300, revenueTop + 10, { width: 100, align: 'right' });
        
        // Ligne des dépenses
        const expenseTop = revenueTop + rowHeight;
        doc.fillColor('#ffffff')
           .rect(doc.page.margins.left, expenseTop, tableWidth, rowHeight)
           .fill();
        
        doc.fillColor(colors.text)
           .text('Total des dépenses', doc.page.margins.left + 10, expenseTop + 10, { align: 'left' })
           .fillColor(colors.expense)
           .text(`${resume.totalDepenses.toFixed(2)} €`, doc.page.margins.left + 300, expenseTop + 10, { width: 100, align: 'right' });
        
        // Ligne du solde
        const balanceTop = expenseTop + rowHeight;
        const solde = resume.totalRevenus - resume.totalDepenses;
        const soldeColor = solde >= 0 ? colors.revenue : colors.expense;
        
        doc.fillColor(colors.lightGray)
           .rect(doc.page.margins.left, balanceTop, tableWidth, rowHeight)
           .fill();
        
        doc.fillColor(colors.primary)
           .text('Solde', doc.page.margins.left + 10, balanceTop + 10, { align: 'left' })
           .fillColor(soldeColor)
           .text(`${solde.toFixed(2)} €`, doc.page.margins.left + 300, balanceTop + 10, { width: 100, align: 'right' });
        
        // Bordure du tableau
        doc.rect(doc.page.margins.left, tableTop, tableWidth, rowHeight * 4)
           .lineWidth(1)
           .stroke(colors.border);
        
        doc.moveDown(3);
    }
    
    /**
     * Ajoute la section des transactions détaillées au document
     * @param {PDFKit.PDFDocument} doc - Document PDF
     * @param {Object} details - Données détaillées des transactions
     * @param {Object} colors - Couleurs du document
     */
    static addTransactionsSection(doc, details, colors) {
        // Vérifier s'il faut sauter à une nouvelle page
        if (doc.y > doc.page.height - 300) {
            doc.addPage();
        }
        
        // Titre de la section
        doc.fontSize(16)
           .fillColor(colors.primary)
           .text('Détails des Transactions', { align: 'center', underline: true })
           .moveDown(1);
        
        // Section des revenus
        if (details.paiements && details.paiements.length > 0) {
            doc.fontSize(14)
               .fillColor(colors.revenue)
               .text('Revenus', { align: 'left', underline: true })
               .moveDown(0.5);
            
            // Tableau des revenus
            this.createRevenueTable(doc, details.paiements, colors);
        }
        
        // Vérifier s'il faut sauter à une nouvelle page avant d'afficher les dépenses
        if (doc.y > doc.page.height - 300 && details.depenses && details.depenses.length > 0) {
            doc.addPage();
        }
        
        // Section des dépenses
        if (details.depenses && details.depenses.length > 0) {
            doc.fontSize(14)
               .fillColor(colors.expense)
               .text('Dépenses', { align: 'left', underline: true })
               .moveDown(0.5);
            
            // Tableau des dépenses
            this.createExpenseTable(doc, details.depenses, colors);
        }
    }
    
    /**
     * Crée un tableau spécifique pour les revenus
     * @param {PDFKit.PDFDocument} doc - Document PDF
     * @param {Array} paiements - Liste des paiements/revenus
     * @param {Object} colors - Couleurs du document
     */
    static createRevenueTable(doc, paiements, colors) {
        const tableTop = doc.y;
        const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const rowHeight = 25;
        const columnWidths = [100, 120, 120, 110]; // Date montant, méthode de paiement, nom, prénom
        
        // En-tête du tableau
        doc.fillColor(colors.revenue)
           .rect(doc.page.margins.left, tableTop, tableWidth, rowHeight)
           .fill();
        
        let xPos = doc.page.margins.left + 10;
        doc.fillColor('#ffffff')
           .fontSize(10);
        
        doc.text('Date', xPos, tableTop + 8, { align: 'left' });
        xPos += columnWidths[0];
        
        doc.text('Montant', xPos, tableTop + 8, { align: 'left' });
        xPos += columnWidths[1];
        
        doc.text('Méthode de paiement', xPos, tableTop + 8, { align: 'left' });
        xPos += columnWidths[2];
        
        doc.text('Client', xPos, tableTop + 8, { align: 'left' });
        
        // Contenu du tableau
        let currentY = tableTop + rowHeight;
        let isEvenRow = false;
        
        paiements.forEach((paiement, index) => {
            // Vérifier s'il faut sauter à une nouvelle page
            if (currentY > doc.page.height - doc.page.margins.bottom - rowHeight) {
                doc.addPage();
                
                // Répéter l'en-tête du tableau sur la nouvelle page
                currentY = doc.page.margins.top;
                doc.fillColor(colors.revenue)
                   .rect(doc.page.margins.left, currentY, tableWidth, rowHeight)
                   .fill();
                
                xPos = doc.page.margins.left + 10;
                doc.fillColor('#ffffff')
                   .fontSize(10);
                
                doc.text('Date', xPos, currentY + 8, { align: 'left' });
                xPos += columnWidths[0];
                
                doc.text('Montant', xPos, currentY + 8, { align: 'left' });
                xPos += columnWidths[1];
                
                doc.text('Méthode de paiement', xPos, currentY + 8, { align: 'left' });
                xPos += columnWidths[2];
                
                doc.text('Client', xPos, currentY + 8, { align: 'left' });
                
                currentY += rowHeight;
                isEvenRow = false;
            }
            
            // Couleur de fond alternée pour les lignes
            doc.fillColor(isEvenRow ? colors.lightGray : '#ffffff')
               .rect(doc.page.margins.left, currentY, tableWidth, rowHeight)
               .fill();
            
            // Contenu de la ligne
            xPos = doc.page.margins.left + 10;
            doc.fillColor(colors.text)
               .fontSize(9);
            
            // Date
            const date = new Date(paiement.date_transaction).toLocaleDateString('fr-FR');
            doc.text(date, xPos, currentY + 8, { width: columnWidths[0] - 10, align: 'left', ellipsis: true });
            xPos += columnWidths[0];
            
            // Montant
            doc.text(
                `${paiement.montant.toFixed(2)} €`, 
                xPos, 
                currentY + 8, 
                { width: columnWidths[1] - 10, align: 'left', ellipsis: true }
            );
            xPos += columnWidths[1];
            
            // Méthode de paiement
            doc.text(paiement.methode_paiement || "Non spécifié", xPos, currentY + 8, 
                    { width: columnWidths[2] - 10, align: 'left', ellipsis: true });
            xPos += columnWidths[2];
            
            // Client (nom et prénom)
            const clientInfo = paiement.reservation.client ? 
                `${paiement.reservation.client.nom || ''} ${paiement.reservation.client.prenom || ''}`.trim() : 
                "Client non spécifié";
            doc.text(clientInfo, xPos, currentY + 8, 
                    { width: columnWidths[3] - 10, align: 'left', ellipsis: true });
            
            // Préparation pour la ligne suivante
            currentY += rowHeight;
            isEvenRow = !isEvenRow;
        });
        
        // Bordure du tableau
        doc.rect(doc.page.margins.left, tableTop, tableWidth, currentY - tableTop)
           .lineWidth(1)
           .stroke(colors.border);
        
        doc.y = currentY + 20;
    }
    
    /**
     * Crée un tableau spécifique pour les dépenses
     * @param {PDFKit.PDFDocument} doc - Document PDF
     * @param {Array} depenses - Liste des dépenses
     * @param {Object} colors - Couleurs du document
     */
    static createExpenseTable(doc, depenses, colors) {
        const tableTop = doc.y;
        const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const rowHeight = 25;
        const columnWidths = [100, 150, 100, 100]; // Date, Description, Catégorie, Montant
        
        // En-tête du tableau
        doc.fillColor(colors.expense)
           .rect(doc.page.margins.left, tableTop, tableWidth, rowHeight)
           .fill();
        
        let xPos = doc.page.margins.left + 10;
        doc.fillColor('#ffffff')
           .fontSize(10);
        
        doc.text('Date', xPos, tableTop + 8, { align: 'left' });
        xPos += columnWidths[0];
        
        doc.text('Description', xPos, tableTop + 8, { align: 'left' });
        xPos += columnWidths[1];
        
        doc.text('Catégorie', xPos, tableTop + 8, { align: 'left' });
        xPos += columnWidths[2];
        
        doc.text('Montant', xPos, tableTop + 8, { align: 'left' });
        
        // Contenu du tableau
        let currentY = tableTop + rowHeight;
        let isEvenRow = false;
        
        depenses.forEach((depense, index) => {
            // Vérifier s'il faut sauter à une nouvelle page
            if (currentY > doc.page.height - doc.page.margins.bottom - rowHeight) {
                doc.addPage();
                
                // Répéter l'en-tête du tableau sur la nouvelle page
                currentY = doc.page.margins.top;
                doc.fillColor(colors.expense)
                   .rect(doc.page.margins.left, currentY, tableWidth, rowHeight)
                   .fill();
                
                xPos = doc.page.margins.left + 10;
                doc.fillColor('#ffffff')
                   .fontSize(10);
                
                doc.text('Date', xPos, currentY + 8, { align: 'left' });
                xPos += columnWidths[0];
                
                doc.text('Description', xPos, currentY + 8, { align: 'left' });
                xPos += columnWidths[1];
                
                doc.text('Catégorie', xPos, currentY + 8, { align: 'left' });
                xPos += columnWidths[2];
                
                doc.text('Montant', xPos, currentY + 8, { align: 'left' });
                
                currentY += rowHeight;
                isEvenRow = false;
            }
            
            // Couleur de fond alternée pour les lignes
            doc.fillColor(isEvenRow ? colors.lightGray : '#ffffff')
               .rect(doc.page.margins.left, currentY, tableWidth, rowHeight)
               .fill();
            
            // Contenu de la ligne
            xPos = doc.page.margins.left + 10;
            doc.fillColor(colors.text)
               .fontSize(9);
            
            // Date
            const date = new Date(depense.date_creation).toLocaleDateString('fr-FR');
            doc.text(date, xPos, currentY + 8, { width: columnWidths[0] - 10, align: 'left', ellipsis: true });
            xPos += columnWidths[0];
            
            // Description
            doc.text(depense.description, xPos, currentY + 8, { width: columnWidths[1] - 10, align: 'left', ellipsis: true });
            xPos += columnWidths[1];
            
            // Catégorie
            doc.text(depense.categorie, xPos, currentY + 8, { width: columnWidths[2] - 10, align: 'left', ellipsis: true });
            xPos += columnWidths[2];
            
            // Montant
            doc.text(
                `${depense.montant.toFixed(2)} €`, 
                xPos, 
                currentY + 8, 
                { width: columnWidths[3] - 10, align: 'left', ellipsis: true }
            );
            
            // Préparation pour la ligne suivante
            currentY += rowHeight;
            isEvenRow = !isEvenRow;
        });
        
        // Bordure du tableau
        doc.rect(doc.page.margins.left, tableTop, tableWidth, currentY - tableTop)
           .lineWidth(1)
           .stroke(colors.border);
        
        doc.y = currentY + 20;
    }
}

export default DepenseService;