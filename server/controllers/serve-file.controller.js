const express         = require('express');
const router          = express.Router();
const common          = require('../helper/common');

let serveCattlePic =(req, res) =>{
    
    // if(req.body.data){
    //     data = JSON.parse(req.body.data);
    // } 
    let vCID = common.get_req_client_id(req);
    
    res.sendFile(path.join(__dirname, 'uploads', req.params.clientid,req.params.filename));
}

router.get('/:filename',serveCattlePic)

module.exports = router;