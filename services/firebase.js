const firebaseConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT?process.env.FIREBASE_SERVICE_ACCOUNT:"{}");
const admin = require('firebase-admin');

if (!admin.apps.length){
    admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
    });
}

let db = admin.firestore();
let auth = admin.auth()

module.exports = {
    getDocument: async (collection_id, document_id) => {
        let docRef = await db.collection(collection_id).doc(document_id);
        try{
            return await docRef.get()
                .then(doc => {
                    return doc.exists? doc.data(): {}
                }).catch(err => {
                    console.error(`[firebase - getDocument/get] : ${err}`)
                    return {}
                })
        }catch(err){
            console.error(`[firebase - getDocument] : ${err}`)
            return {}
        }
    },
    setDocument: async (collection_id, document_id, data) =>{
        try{
            return await db.collection(collection_id)
                .doc(document_id)
                .set(data, {merge: true});
        }catch(err){
            console.error(`[firebase - setDocument] : ${err}`)
            return {}
        }
    },
    getCollection: async (collection_id) => {
        try{
            let resultList = [];
            await db.collection(collection_id).get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        resultList.push(doc.data());
                      });
                })
            return resultList
        }catch(err){
            console.error(`[firebase - getCollection] : ${err}`)
            return []
        }
    },
    getDB: ()=> db,
    getAuth: () => auth,
    createNewAccount: async (payload) => {
        let uid = "";
        await auth.createUser(payload)
        .then(res => {
            uid = res.uid
        })
        .catch(err => err);
        return uid
    },
    verifyIdToken: async (idToken, uid) => {
        return await auth.verifyIdToken(idToken)
            .then(decodedToken => {
                return decodedToken.uid === uid? true : false
            }).catch(err => {
                console.error(`[verifyIdToken] : ${err}`)
                return false
            })
    }
}
