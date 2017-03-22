var fs = require('fs');

var setup_status = false;
var opt;
var stats = {}
var DEFAULT_MINS = 15;
var interval = DEFAULT_MINS * 60 * 1000;
var MODULE_PREFIX = 'apistats:';


var init = function(options) {

	//check if the file exists if not create the file and initialize with an empty json
	opt = options;
	if (options.hasOwnProperty('filepath')){
		fs.stat(options.filepath, function(err, stat) {
		    if(err == null) {
		        //read file
		        fs.readFile(options.filepath, function read(err, data) {
				    if (err) {
				        console.log(err);
				    }
				    stats = JSON.parse(data);
				    setup_status = true;
				    sync();
				});
		    } else if(err.code == 'ENOENT') {
		        // file does not exist
		        fs.writeFile(options.filepath, '{}', (err) => {
				  if (err) {
				  	console.log(err);
				  }else{
				  	setup_status = true;
				  	sync();
				  }
				});
		        
		    } else {
		        console.log(MODULE_PREFIX+' error in opening file: ', err.code);
		    }
		});
	}else{
		console.log(MODULE_PREFIX+' filepath not supplied in options.')
	}

	if (options.hasOwnProperty('interval')){
		var minutes = options.interval;
		if (minutes === parseInt(minutes,10)){
			interval = minutes * 60 *100;
		}else{
			console.log(MODULE_PREFIX+'Non integer interval in minutes is not defined')
		}
	}


}

var map = function(req,res,next){
	compute(req,res,function(err){
		console.log(MODULE_PREFIX+err.message)
	})
	next();
}

function compute(req,res,cb){

	var method = req.method
	var url = req.url
	
	var pathparams = req.params 
	var queryparams = req.query 

	var parampath = null;
	var querypath = null;
    
    if (Object.keys(pathparams).length !== 0){
    	var vals = Object.keys(pathparams).map(function(key) {
		    return pathparams[key];
		});
    	var re = new RegExp(vals.join("|"),"g");
		parampath = req.path.replace(re, function(matched){
		  return '';
		});
    }

    if (Object.keys(queryparams).length !== 0){
    	querypath = req.path
    	//query path may be same as parampath or url
    }

	var paths = [url]
	if (parampath) paths.push(parampath)
	if (querypath) paths.push(querypath)

	var uniquePaths = paths.filter(function(elem, pos) {
    	return paths.indexOf(elem) == pos;
	})

	if (setup_status){
		uniquePaths.forEach(function(path){
			var key = method+' '+path
			if (stats.hasOwnProperty(key)){
				stats[key] = stats[key] + 1
			}else{
				stats[key] = 1
			}
		})
	}else{
		cb({message:'Error: Incomplete setup'})
	}

}

var sync = function(){
	setInterval(writeFile,interval);
}

var writeFile = function(){
	fs.writeFile(opt.filepath, JSON.stringify(stats), (err) => {
				  if (err) {
				  	console.log(MODULE_PREFIX+'Unable to write file' +err);
				  }
	})
}

module.exports = {
	init,
	map
}

