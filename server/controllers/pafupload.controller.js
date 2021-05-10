const express         = require('express'); 
const router          = express.Router();
const multer = require('multer');
const fs = require('fs');
const common  = require('../helper/common');
const TYPES = require('tedious').TYPES;

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('filename')
        console.log(file)
        let filename = file.originalname.split("|");        
        cb(null, process.env.APP_FILE_UPLOAD_PATH+'\\'+filename[1]+'\\')
    },
    filename: (req, file, cb) => { 
        cb(null,getfilename()+ ".xlsx");         
    }
});

let uploadXL = (req, res) => {
    //console.log(req.body);
    // var xlFile = getfilename() 
   // var dir = '../uploads/' + xlFile + ".xlsx";
    //console.log(dir);
    // // if (!fs.existsSync(dir)) {
    // //     fs.mkdirSync(dir);
    // // }
    let upload = multer({ storage: storage }).single("file");
    
    let data = {};
    upload(req, res, function (err) {
        //console.log('upload');
        //console.log(req.file);
        if (err) {
            console.log(err);
        } else {
           // console.log(req.body);
            if (req.body.data) {
                data = JSON.parse(req.body.data);
                //console.log(data);
                console.log(req.file.path)
                let dbPath = String(req.file.path).replace(process.env.APP_FILE_UPLOAD_PATH,process.env.DB_FILE_IMPORT_PATH);
                
                var statement = 'sp_upt_xl_timesheet';    
                let paramIn = [
                     {name:'p_xl_path',type:TYPES.VarChar,value:dbPath}    
                    ,{name:'p_xl_template',type:TYPES.VarChar,value:data.template}    
                    ,{name:'p_usr_id',type:TYPES.Int,value:data.usr_id}
                    ,{name:'p_cut_start_dt',type:TYPES.Date,value:data.cutoff_start_dt}  
                    ,{name:'p_cut_end_dt',type:TYPES.Date,value:data.cutoff_end_dt}  
                    ,{name:'p_xl_file_name',type:TYPES.VarChar,value:data.file_name}  
                    ,{name:'p_wk_id',type:TYPES.Int,value:data.spl_wk_id}  
                    ];
                console.log(paramIn);
                let paramOut = [    
                    ,{name:'p_err_code',type:TYPES.VarChar,value: null }
                    ,{name:'p_err_desc',type:TYPES.VarChar,value: null }
                    ];
                common.callProcedure(statement, paramIn,paramOut, (err, result) => { 
                    //console.log(err) ;
                    if(err) return common.sendFullResponse(req, res, 500, {}, err); 
                    let errNO = null;
                    let errDesc =null;
                    paramOut.forEach(elem =>{
                        if(elem.name =='p_err_code'){
                            errNO = elem.value
                        }
                        if(elem.name =='p_err_desc'){
                            errDesc = elem.value
                        }  
                    }) 
                    if (errNO == '200') {                         
                        common.sendFullResponse(req, res, errNO, result, errDesc);
                    } else {                         
                        common.sendFullResponse(req, res, 300, result, errDesc);
                    }
                });
            }
        }
    });
}

let getfilename = () =>{
    var now = new Date();
    // Create formatted time
    var yyyy = now.getFullYear();
    var mm = now.getMonth() < 9 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1); // getMonth() is zero-based
    var dd  = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();
    var hh = now.getHours() < 10 ? "0" + now.getHours() : now.getHours();
    var mmm  = now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes();
    var ss  = now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds();

    // file path with / at the end                   // This is the path
    var filename =yyyy+mm+dd+"-"+hh+mmm+ss;     // file name
    return filename;
}

 

/* ------------------------- ALL ROUTES ------------------------ */
 
router.post('/uploadxl', uploadXL);


module.exports = router;
 