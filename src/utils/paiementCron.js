import PaiementService from "../services/paiement.service.js";
import { genererContenuEmail } from "../services/paiement.service.js";
import cron from 'node-cron'

/**
 * Tâche planifiée qui s'exécute tous les lundis à 9h pour envoyer un rapport
 * des paiements clients en retard à la comptabilité.
 */
cron.schedule('0 9 * * 1', async () => {
    try {
        const paiementsEnRetard = await PaiementService.getPaiementsEnRetard();
        if (paiementsEnRetard.length === 0) {
            sendEmail(
              'comptable@psah.com',
              '[PSAH] Rapport hebdo - Aucun paiement en retard',
              '<p>Tous les paiements sont à jour cette semaine. Rien à signaler.</p>'
            );
            return;
        }
          

        const contenu = genererContenuEmail(paiementsEnRetard);
        sendEmail(
        'comptable@psah.com', // A modifier avec l'adresse du destinataire réel
        '[PSAH] Rapport hebdomadaire - Paiements clients en retard',
        contenu
        );
    } catch (error) {
        console.log('Aucun paiement en retard à signaler.');
    }
});
