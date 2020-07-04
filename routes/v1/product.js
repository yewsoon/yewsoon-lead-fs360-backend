var express = require('express');
var router = express.Router();
const asyncHandler = require("express-async-handler");
const fb = require('../../services/firebase');
const PRODUCT_COLLECTION = "products";

router.post("/new" , asyncHandler(async function(req, res, next){
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
}))

const saveDoc = async (collection_id, product) => {
    return await fb.getDB()
        .collection(collection_id)
        .add(product)
        .then(res=>res.id)
}

module.exports = router;