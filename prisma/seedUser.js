import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = [
        {
          fullName: "Alice Dupont",
          email: "alice.dupont@example.com",
          password: "password123",
          roleId: "SUPER_ADMIN",
          phoneNumber: "0600000001"
        },
        {
          fullName: "Bruno Martin",
          email: "bruno.martin@example.com",
          password: "password123",
          roleId: "ADMIN_GENERAL",
          phoneNumber: "0600000002"
        },
        {
          fullName: "Claire Bernard",
          email: "claire.bernard@example.com",
          password: "password123",
          roleId: "RESPONSABLE_HEBERGEMENT",
          phoneNumber: "0600000003"
        },
        {
          fullName: "David Leroy",
          email: "david.leroy@example.com",
          password: "password123",
          roleId: "RECEPTIONNISTE",
          phoneNumber: "0600000004"
        },
        {
          fullName: "Emma Robert",
          email: "emma.robert@example.com",
          password: "password123",
          roleId: "PROPRIETAIRE",
          phoneNumber: "0600000005"
        },
        {
          fullName: "François Moreau",
          email: "francois.moreau@example.com",
          password: "password123",
          roleId: "MAINTENANCE",
          phoneNumber: "0600000006"
        },
        {
          fullName: "Gabrielle Petit",
          email: "gabrielle.petit@example.com",
          password: "password123",
          roleId: "CLIENT",
          phoneNumber: "0600000007"
        },
        {
          fullName: "Hugo Lefevre",
          email: "hugo.lefevre@example.com",
          password: "password123",
          roleId: "CHAUFFEUR",
          phoneNumber: "0600000008"
        },
        {
          fullName: "Inès Roux",
          email: "ines.roux@example.com",
          password: "password123",
          roleId: "COMPTABILITE",
          phoneNumber: "0600000009"
        }
      ];
      for(const user of users){
        
        const roleObject = await prisma.role.findUnique({
            where: { name: user.roleId },
        })
        if(roleObject){
            await prisma.utilisateur.create({
                data: { ...user, roleId: roleObject.id }
            }).then((newUser) => {
                console.log("l'utilisateur:  " + newUser + " a été créé avec succès");
            }).catch((error) => {
                console.error("Erreur lors de la création de l'utilisateur: ", error);
            });
        }
        
    }
}

main()
.then(async () => {
    await prisma.$disconnect();
})
.catch(async (e) => {
    console.error(e);

      }
      
)

