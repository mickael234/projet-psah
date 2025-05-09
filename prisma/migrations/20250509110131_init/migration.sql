-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('client', 'personnel', 'administrateur');

-- CreateEnum
CREATE TYPE "EtatChambre" AS ENUM ('disponible', 'occupee', 'maintenance');

-- CreateEnum
CREATE TYPE "EtatReservation" AS ENUM ('en_attente', 'confirmee', 'annulee', 'enregistree', 'depart');

-- CreateEnum
CREATE TYPE "EtatPaiement" AS ENUM ('en_attente', 'complete', 'echoue', 'rembourse');

-- CreateEnum
CREATE TYPE "TypeMedia" AS ENUM ('image', 'video', 'visite_360', 'apercu_ar');

-- CreateTable
CREATE TABLE "Permission" (
    "id_permission" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id_permission")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id_role_permission" SERIAL NOT NULL,
    "id_role" INTEGER NOT NULL,
    "id_permission" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id_role_permission")
);

-- CreateTable
CREATE TABLE "Role" (
    "id_role" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id_utilisateur" SERIAL NOT NULL,
    "nom_utilisateur" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "RoleUtilisateur" NOT NULL,
    "fournisseur_auth" TEXT,
    "id_auth_externe" TEXT,
    "supprime_le" TIMESTAMP(3),
    "id_role" INTEGER,
    "photo_profil" TEXT,
    "authentification_deux_facteurs" BOOLEAN NOT NULL DEFAULT false,
    "secret_deux_facteurs" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "Client" (
    "id_client" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "statut_membre" TEXT,
    "consentement_marketing" BOOLEAN NOT NULL DEFAULT false,
    "supprime_le" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "Personnel" (
    "id_personnel" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "poste" TEXT,
    "date_embauche" TIMESTAMP(3),

    CONSTRAINT "Personnel_pkey" PRIMARY KEY ("id_personnel")
);

-- CreateTable
CREATE TABLE "Chambre" (
    "id_chambre" SERIAL NOT NULL,
    "numero_chambre" TEXT NOT NULL,
    "type_chambre" TEXT NOT NULL,
    "prix_par_nuit" DECIMAL(10,2) NOT NULL,
    "etat" "EtatChambre" NOT NULL,
    "description" TEXT,
    "date_modification" TIMESTAMP(3),
    "modifie_par" INTEGER,

    CONSTRAINT "Chambre_pkey" PRIMARY KEY ("id_chambre")
);

-- CreateTable
CREATE TABLE "JournalModifications" (
    "id_journal" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "type_ressource" TEXT NOT NULL,
    "id_ressource" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalModifications_pkey" PRIMARY KEY ("id_journal")
);

-- CreateTable
CREATE TABLE "Equipement" (
    "id_equipement" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Equipement_pkey" PRIMARY KEY ("id_equipement")
);

-- CreateTable
CREATE TABLE "ChambresEquipements" (
    "id_chambre" INTEGER NOT NULL,
    "id_equipement" INTEGER NOT NULL,

    CONSTRAINT "ChambresEquipements_pkey" PRIMARY KEY ("id_chambre","id_equipement")
);

-- CreateTable
CREATE TABLE "Facture" (
    "id_facture" SERIAL NOT NULL,
    "id_reservation" INTEGER NOT NULL,
    "montant_total" DECIMAL(10,2) NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_envoi" TIMESTAMP(3),
    "date_paiement" TIMESTAMP(3),
    "etat" TEXT NOT NULL DEFAULT 'en_attente',
    "details" JSONB,
    "notes" TEXT,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id_facture")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id_reservation" SERIAL NOT NULL,
    "id_client" INTEGER NOT NULL,
    "date_reservation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "etat" "EtatReservation" NOT NULL,
    "prix_total" DECIMAL(10,2),
    "etat_paiement" "EtatPaiement",
    "source_reservation" TEXT,
    "id_reservation_externe" TEXT,
    "supprime_le" TIMESTAMP(3),

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id_reservation")
);

-- CreateTable
CREATE TABLE "ReservationsChambre" (
    "id_reservation" INTEGER NOT NULL,
    "id_chambre" INTEGER NOT NULL,
    "date_arrivee" TIMESTAMP(3) NOT NULL,
    "date_depart" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationsChambre_pkey" PRIMARY KEY ("id_reservation","id_chambre")
);

-- CreateTable
CREATE TABLE "Service" (
    "id_service" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "prix" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id_service")
);

-- CreateTable
CREATE TABLE "ReservationsServices" (
    "id_reservation" INTEGER NOT NULL,
    "id_service" INTEGER NOT NULL,
    "date_demande" TIMESTAMP(3) NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ReservationsServices_pkey" PRIMARY KEY ("id_reservation","id_service","date_demande")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id_paiement" SERIAL NOT NULL,
    "id_reservation" INTEGER NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "methode_paiement" TEXT,
    "date_transaction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "etat" "EtatPaiement" NOT NULL,
    "reference_transaction" TEXT,
    "numero_echeance" INTEGER,
    "total_echeances" INTEGER,
    "notes" TEXT,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id_paiement")
);

-- CreateTable
CREATE TABLE "Avis" (
    "id_avis" SERIAL NOT NULL,
    "id_reservation" INTEGER NOT NULL,
    "note" INTEGER,
    "commentaire" TEXT,
    "date_avis" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avis_pkey" PRIMARY KEY ("id_avis")
);

-- CreateTable
CREATE TABLE "Media" (
    "id_media" SERIAL NOT NULL,
    "id_chambre" INTEGER NOT NULL,
    "type_media" "TypeMedia" NOT NULL,
    "url" TEXT NOT NULL,
    "titre" TEXT,
    "description" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id_media")
);

-- CreateTable
CREATE TABLE "Fidelite" (
    "id_fidelite" SERIAL NOT NULL,
    "id_client" INTEGER NOT NULL,
    "solde_points" INTEGER NOT NULL DEFAULT 0,
    "derniere_mise_a_jour" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fidelite_pkey" PRIMARY KEY ("id_fidelite")
);

-- CreateTable
CREATE TABLE "TransactionFidelite" (
    "id_transaction" SERIAL NOT NULL,
    "id_fidelite" INTEGER NOT NULL,
    "changement_points" INTEGER NOT NULL,
    "raison" TEXT,
    "date_transaction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionFidelite_pkey" PRIMARY KEY ("id_transaction")
);

-- CreateTable
CREATE TABLE "ServiceLocal" (
    "id_service" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "contact" TEXT,
    "categorie" TEXT,

    CONSTRAINT "ServiceLocal_pkey" PRIMARY KEY ("id_service")
);

-- CreateTable
CREATE TABLE "PreferenceUtilisateur" (
    "id_utilisateur" INTEGER NOT NULL,
    "type_preference" TEXT NOT NULL,
    "valeur" TEXT,

    CONSTRAINT "PreferenceUtilisateur_pkey" PRIMARY KEY ("id_utilisateur","type_preference")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id_notification" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "contenu" TEXT,
    "etat" TEXT NOT NULL,
    "envoye_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "JournalChatbot" (
    "id_journal" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "requete" TEXT,
    "reponse" TEXT,
    "horodatage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalChatbot_pkey" PRIMARY KEY ("id_journal")
);

-- CreateTable
CREATE TABLE "HistoriquePrix" (
    "id_prix" SERIAL NOT NULL,
    "id_chambre" INTEGER NOT NULL,
    "ancien_prix" DECIMAL(10,2),
    "nouveau_prix" DECIMAL(10,2) NOT NULL,
    "modifie_par" TEXT,
    "modifie_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoriquePrix_pkey" PRIMARY KEY ("id_prix")
);

-- CreateTable
CREATE TABLE "ReservationsServicesLocaux" (
    "id_reservation_service" SERIAL NOT NULL,
    "id_reservation" INTEGER NOT NULL,
    "id_service_local" INTEGER NOT NULL,
    "heure_reservation" TIMESTAMP(3),
    "etat" TEXT,

    CONSTRAINT "ReservationsServicesLocaux_pkey" PRIMARY KEY ("id_reservation_service")
);

-- CreateTable
CREATE TABLE "ActiviteUtilisateur" (
    "id_activite" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "horodatage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActiviteUtilisateur_pkey" PRIMARY KEY ("id_activite")
);

-- CreateTable
CREATE TABLE "CatalogueRecompense" (
    "id_recompense" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "points_requis" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "CatalogueRecompense_pkey" PRIMARY KEY ("id_recompense")
);

-- CreateTable
CREATE TABLE "EchangeFidelite" (
    "id_echange" SERIAL NOT NULL,
    "id_fidelite" INTEGER NOT NULL,
    "id_recompense" INTEGER NOT NULL,
    "points_utilises" INTEGER NOT NULL,
    "date_echange" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EchangeFidelite_pkey" PRIMARY KEY ("id_echange")
);

-- CreateTable
CREATE TABLE "ConfigurationSysteme" (
    "id" SERIAL NOT NULL,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "categorie" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigurationSysteme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Communication" (
    "id_communication" SERIAL NOT NULL,
    "sujet" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "id_expediteur" INTEGER NOT NULL,
    "id_destinataire" INTEGER,
    "departement_expediteur" TEXT,
    "departement_destinataire" TEXT,
    "priorite" TEXT NOT NULL DEFAULT 'NORMALE',
    "statut" TEXT NOT NULL DEFAULT 'NON_LU',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3),

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id_communication")
);

-- CreateTable
CREATE TABLE "ReponseCommunication" (
    "id_reponse" SERIAL NOT NULL,
    "id_communication" INTEGER NOT NULL,
    "id_expediteur" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReponseCommunication_pkey" PRIMARY KEY ("id_reponse")
);

-- CreateTable
CREATE TABLE "TachePlanifiee" (
    "id_tache" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "id_chambre" INTEGER,
    "id_responsable" INTEGER NOT NULL,
    "type_tache" TEXT NOT NULL,
    "priorite" TEXT NOT NULL DEFAULT 'NORMALE',
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIEE',
    "recurrence" TEXT,
    "notes" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3),

    CONSTRAINT "TachePlanifiee_pkey" PRIMARY KEY ("id_tache")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id_maintenance" SERIAL NOT NULL,
    "id_chambre" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL,
    "priorite" TEXT NOT NULL,
    "date_fin" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id_maintenance")
);

-- CreateTable
CREATE TABLE "CommentaireTache" (
    "id_commentaire" SERIAL NOT NULL,
    "id_tache" INTEGER NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentaireTache_pkey" PRIMARY KEY ("id_commentaire")
);

-- CreateTable
CREATE TABLE "Fourniture" (
    "id_fourniture" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "categorie" TEXT NOT NULL,
    "quantite_stock" INTEGER NOT NULL DEFAULT 0,
    "unite" TEXT,
    "prix_unitaire" DECIMAL(10,2),
    "seuil_alerte" INTEGER,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3),

    CONSTRAINT "Fourniture_pkey" PRIMARY KEY ("id_fourniture")
);

-- CreateTable
CREATE TABLE "UtilisationFourniture" (
    "id_utilisation" SERIAL NOT NULL,
    "id_fourniture" INTEGER NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "date_utilisation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "id_chambre" INTEGER,

    CONSTRAINT "UtilisationFourniture_pkey" PRIMARY KEY ("id_utilisation")
);

-- CreateTable
CREATE TABLE "CommandeFourniture" (
    "id_commande" SERIAL NOT NULL,
    "reference" TEXT,
    "fournisseur" TEXT,
    "date_commande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_livraison_prevue" TIMESTAMP(3),
    "date_livraison" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "notes" TEXT,
    "id_utilisateur" INTEGER NOT NULL,

    CONSTRAINT "CommandeFourniture_pkey" PRIMARY KEY ("id_commande")
);

-- CreateTable
CREATE TABLE "DetailCommandeFourniture" (
    "id_detail" SERIAL NOT NULL,
    "id_commande" INTEGER NOT NULL,
    "id_fourniture" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_unitaire" DECIMAL(10,2),

    CONSTRAINT "DetailCommandeFourniture_pkey" PRIMARY KEY ("id_detail")
);

-- CreateTable
CREATE TABLE "Nettoyage" (
    "id_nettoyage" SERIAL NOT NULL,
    "id_chambre" INTEGER NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "date_nettoyage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Nettoyage_pkey" PRIMARY KEY ("id_nettoyage")
);

-- CreateTable
CREATE TABLE "NettoyageFourniture" (
    "id_nettoyage" INTEGER NOT NULL,
    "id_fourniture" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "NettoyageFourniture_pkey" PRIMARY KEY ("id_nettoyage","id_fourniture")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "RolePermission_id_role_idx" ON "RolePermission"("id_role");

-- CreateIndex
CREATE INDEX "RolePermission_id_permission_idx" ON "RolePermission"("id_permission");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_id_role_id_permission_key" ON "RolePermission"("id_role", "id_permission");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_nom_utilisateur_key" ON "Utilisateur"("nom_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE INDEX "Utilisateur_email_idx" ON "Utilisateur"("email");

-- CreateIndex
CREATE INDEX "Utilisateur_id_role_idx" ON "Utilisateur"("id_role");

-- CreateIndex
CREATE UNIQUE INDEX "Client_id_utilisateur_key" ON "Client"("id_utilisateur");

-- CreateIndex
CREATE INDEX "Client_id_utilisateur_idx" ON "Client"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "Personnel_id_utilisateur_key" ON "Personnel"("id_utilisateur");

-- CreateIndex
CREATE INDEX "Facture_id_reservation_idx" ON "Facture"("id_reservation");

-- CreateIndex
CREATE INDEX "Reservation_id_client_idx" ON "Reservation"("id_client");

-- CreateIndex
CREATE INDEX "ReservationsChambre_date_arrivee_idx" ON "ReservationsChambre"("date_arrivee");

-- CreateIndex
CREATE INDEX "ReservationsChambre_date_depart_idx" ON "ReservationsChambre"("date_depart");

-- CreateIndex
CREATE INDEX "Paiement_id_reservation_idx" ON "Paiement"("id_reservation");

-- CreateIndex
CREATE UNIQUE INDEX "Avis_id_reservation_key" ON "Avis"("id_reservation");

-- CreateIndex
CREATE INDEX "Avis_id_reservation_idx" ON "Avis"("id_reservation");

-- CreateIndex
CREATE INDEX "Media_id_chambre_idx" ON "Media"("id_chambre");

-- CreateIndex
CREATE UNIQUE INDEX "Fidelite_id_client_key" ON "Fidelite"("id_client");

-- CreateIndex
CREATE INDEX "Fidelite_id_client_idx" ON "Fidelite"("id_client");

-- CreateIndex
CREATE INDEX "ActiviteUtilisateur_id_utilisateur_idx" ON "ActiviteUtilisateur"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigurationSysteme_cle_key" ON "ConfigurationSysteme"("cle");

-- CreateIndex
CREATE INDEX "Communication_id_expediteur_idx" ON "Communication"("id_expediteur");

-- CreateIndex
CREATE INDEX "Communication_id_destinataire_idx" ON "Communication"("id_destinataire");

-- CreateIndex
CREATE INDEX "ReponseCommunication_id_communication_idx" ON "ReponseCommunication"("id_communication");

-- CreateIndex
CREATE INDEX "ReponseCommunication_id_expediteur_idx" ON "ReponseCommunication"("id_expediteur");

-- CreateIndex
CREATE INDEX "TachePlanifiee_id_chambre_idx" ON "TachePlanifiee"("id_chambre");

-- CreateIndex
CREATE INDEX "TachePlanifiee_id_responsable_idx" ON "TachePlanifiee"("id_responsable");

-- CreateIndex
CREATE INDEX "Maintenance_id_chambre_idx" ON "Maintenance"("id_chambre");

-- CreateIndex
CREATE INDEX "CommentaireTache_id_tache_idx" ON "CommentaireTache"("id_tache");

-- CreateIndex
CREATE INDEX "CommentaireTache_id_utilisateur_idx" ON "CommentaireTache"("id_utilisateur");

-- CreateIndex
CREATE INDEX "UtilisationFourniture_id_fourniture_idx" ON "UtilisationFourniture"("id_fourniture");

-- CreateIndex
CREATE INDEX "UtilisationFourniture_id_utilisateur_idx" ON "UtilisationFourniture"("id_utilisateur");

-- CreateIndex
CREATE INDEX "UtilisationFourniture_id_chambre_idx" ON "UtilisationFourniture"("id_chambre");

-- CreateIndex
CREATE INDEX "CommandeFourniture_id_utilisateur_idx" ON "CommandeFourniture"("id_utilisateur");

-- CreateIndex
CREATE INDEX "DetailCommandeFourniture_id_commande_idx" ON "DetailCommandeFourniture"("id_commande");

-- CreateIndex
CREATE INDEX "DetailCommandeFourniture_id_fourniture_idx" ON "DetailCommandeFourniture"("id_fourniture");

-- CreateIndex
CREATE INDEX "Nettoyage_id_chambre_idx" ON "Nettoyage"("id_chambre");

-- CreateIndex
CREATE INDEX "Nettoyage_id_utilisateur_idx" ON "Nettoyage"("id_utilisateur");

-- CreateIndex
CREATE INDEX "NettoyageFourniture_id_nettoyage_idx" ON "NettoyageFourniture"("id_nettoyage");

-- CreateIndex
CREATE INDEX "NettoyageFourniture_id_fourniture_idx" ON "NettoyageFourniture"("id_fourniture");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "Role"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_id_permission_fkey" FOREIGN KEY ("id_permission") REFERENCES "Permission"("id_permission") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "Role"("id_role") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personnel" ADD CONSTRAINT "Personnel_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalModifications" ADD CONSTRAINT "JournalModifications_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChambresEquipements" ADD CONSTRAINT "ChambresEquipements_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "Chambre"("id_chambre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChambresEquipements" ADD CONSTRAINT "ChambresEquipements_id_equipement_fkey" FOREIGN KEY ("id_equipement") REFERENCES "Equipement"("id_equipement") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "Reservation"("id_reservation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Client"("id_client") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationsChambre" ADD CONSTRAINT "ReservationsChambre_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "Chambre"("id_chambre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationsChambre" ADD CONSTRAINT "ReservationsChambre_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "Reservation"("id_reservation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationsServices" ADD CONSTRAINT "ReservationsServices_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "Reservation"("id_reservation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationsServices" ADD CONSTRAINT "ReservationsServices_id_service_fkey" FOREIGN KEY ("id_service") REFERENCES "Service"("id_service") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "Reservation"("id_reservation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "Reservation"("id_reservation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "Chambre"("id_chambre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fidelite" ADD CONSTRAINT "Fidelite_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Client"("id_client") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionFidelite" ADD CONSTRAINT "TransactionFidelite_id_fidelite_fkey" FOREIGN KEY ("id_fidelite") REFERENCES "Fidelite"("id_fidelite") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreferenceUtilisateur" ADD CONSTRAINT "PreferenceUtilisateur_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalChatbot" ADD CONSTRAINT "JournalChatbot_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriquePrix" ADD CONSTRAINT "HistoriquePrix_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "Chambre"("id_chambre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationsServicesLocaux" ADD CONSTRAINT "ReservationsServicesLocaux_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "Reservation"("id_reservation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationsServicesLocaux" ADD CONSTRAINT "ReservationsServicesLocaux_id_service_local_fkey" FOREIGN KEY ("id_service_local") REFERENCES "ServiceLocal"("id_service") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiviteUtilisateur" ADD CONSTRAINT "ActiviteUtilisateur_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EchangeFidelite" ADD CONSTRAINT "EchangeFidelite_id_fidelite_fkey" FOREIGN KEY ("id_fidelite") REFERENCES "Fidelite"("id_fidelite") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EchangeFidelite" ADD CONSTRAINT "EchangeFidelite_id_recompense_fkey" FOREIGN KEY ("id_recompense") REFERENCES "CatalogueRecompense"("id_recompense") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_id_expediteur_fkey" FOREIGN KEY ("id_expediteur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_id_destinataire_fkey" FOREIGN KEY ("id_destinataire") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReponseCommunication" ADD CONSTRAINT "ReponseCommunication_id_communication_fkey" FOREIGN KEY ("id_communication") REFERENCES "Communication"("id_communication") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReponseCommunication" ADD CONSTRAINT "ReponseCommunication_id_expediteur_fkey" FOREIGN KEY ("id_expediteur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TachePlanifiee" ADD CONSTRAINT "TachePlanifiee_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "Chambre"("id_chambre") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TachePlanifiee" ADD CONSTRAINT "TachePlanifiee_id_responsable_fkey" FOREIGN KEY ("id_responsable") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "Chambre"("id_chambre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentaireTache" ADD CONSTRAINT "CommentaireTache_id_tache_fkey" FOREIGN KEY ("id_tache") REFERENCES "TachePlanifiee"("id_tache") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentaireTache" ADD CONSTRAINT "CommentaireTache_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilisationFourniture" ADD CONSTRAINT "UtilisationFourniture_id_fourniture_fkey" FOREIGN KEY ("id_fourniture") REFERENCES "Fourniture"("id_fourniture") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilisationFourniture" ADD CONSTRAINT "UtilisationFourniture_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilisationFourniture" ADD CONSTRAINT "UtilisationFourniture_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "Chambre"("id_chambre") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandeFourniture" ADD CONSTRAINT "CommandeFourniture_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailCommandeFourniture" ADD CONSTRAINT "DetailCommandeFourniture_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "CommandeFourniture"("id_commande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailCommandeFourniture" ADD CONSTRAINT "DetailCommandeFourniture_id_fourniture_fkey" FOREIGN KEY ("id_fourniture") REFERENCES "Fourniture"("id_fourniture") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nettoyage" ADD CONSTRAINT "Nettoyage_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "Chambre"("id_chambre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nettoyage" ADD CONSTRAINT "Nettoyage_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NettoyageFourniture" ADD CONSTRAINT "NettoyageFourniture_id_nettoyage_fkey" FOREIGN KEY ("id_nettoyage") REFERENCES "Nettoyage"("id_nettoyage") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NettoyageFourniture" ADD CONSTRAINT "NettoyageFourniture_id_fourniture_fkey" FOREIGN KEY ("id_fourniture") REFERENCES "Fourniture"("id_fourniture") ON DELETE RESTRICT ON UPDATE CASCADE;
