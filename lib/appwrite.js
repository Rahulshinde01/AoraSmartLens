import { Account, Avatars, Client, Databases, ID, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.aora',
    projectId: '676faceb0018066d653b',
    databaseId: '676fafaa002b2fc72dbb',
    userCollectionId: '676faff80036521e96e2',
    videoCollectionId: '676fb0400022ebddfbf1',
    storageId: '676fb24c0008f97eb9e2',
}

// Init your React Native SDK
const client = new Client();
client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.
;



const account = new Account(client); // account instance  using appwrite function "Account"
const avatars = new Avatars(client);
const databases = new Databases(client); // database instance using appwrite

export const createUser = async (email, password, username) =>{
        try {
            const newAccount = await account.create(
                ID.unique(),
                email,
                password,
                username
            )

            if(!newAccount) throw Error;


            const avatarUrl = avatars.getInitials(username);

            await signIn(email, password);

            // creating user in DB
            const newUser = await databases.createDocument(
                config.databaseId,
                config.userCollectionId,
                ID.unique(),
                {
                    accountId: newAccount.$id,
                    email,
                    username,
                    avatar: avatarUrl
                }
            )

            return newUser;

            
        } catch (error) {
            console.log(error);

            throw new Error(error);
        }
}


export const signIn = async(email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password)

        return session;
        
    } catch (error) {
        throw new Error(error);
    }
}


export const getCurrentUser = async () =>{
    try{
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    }catch(error){
        console.log(error)
    }
}