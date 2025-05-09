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
