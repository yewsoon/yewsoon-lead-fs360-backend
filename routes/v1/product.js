var express = require('express');
var router = express.Router();
const asyncHandler = require("express-async-handler");
const fb = require('../../services/firebase');
const PRODUCT_COLLECTION = "products";

router.post("/new", asyncHandler(async function(req, res, next){
    const payload = req.body;
    try{
        const status = await saveDoc(
            PRODUCT_COLLECTION,
            payload
        )
        return res.json({status: status})
    }catch(error){
        console.error('[/pd/new] error : ${error}');
        return res.json({status: 'Error - ${error}'})
    }
}));

router.use(asyncHandler(async function(req, res, next){
    const headers = req.headers;
    try{
        if(!fb.verifyIdToken(headers.id, headers.uid)){
            return res.json({status:"Access is prohibited"})
        }
        next();
    }catch(err){
        console.error('[Users API Middleware] : $(err)')
        return res.json({status:"Access is prohibited"})
    }
}));

router.get("/all", asyncHandler(async function(req, res, next){
    try{
        const productList = await getAll(PRODUCT_COLLECTION)
        return res.json({products: productList})
    }catch(error){
        console.log('[products/pd] error : $(error)');
        return res.json({})
    }
}));

const getAll = async (collection_id) => {
    let resultList = []
    await fb.getDB()
        .collection(collection_id)
        .get()
        .then(snapshot => {
            snapshot.forEach( doc => {
                let prod = doc.data();
                prod["id"] = doc.id
                resultList.push(prod);
            });
        }).catch(err => {
            console.log(err)
            return resultList
        })
    return resultList
}

const saveDoc = async (collection_id, product) => {
    return await fb.getDB()
        .collection(collection_id)
        .add(product)
        .then(res=>res.id)
}

module.exports = router;