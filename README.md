# Apistats
Ligtweight middleware to collect statistics for your nodejs rest api calls

# Installation
```javascript
npm install apistats
```

# Usage

```javascript
//Require apistats
var app = require('express')();
var apistats = require('apistats');

//Initialize apistats module
var apistats_options = {
  filepath : './apistats.json',  //required: this is where all the statistics will be stored
  interval : 15 //interval in minutes when the file gets updated. Default is 15 mins
}
apistats.init(apistats_options)

//Include apistats in all API calls
app.all('*',apistats.map)
```

# Features
## v1.0.0 
Count the number of times an API is called taking path and query parameters into account

# Dependency
Express > 2.x

# Execution time
Mean execution time : 0.762ms (50 runs)
Min execution time : 0.321ms
Max execution time : 3.323ms
API stats will add 0.762ms on an average to every API call whose analytics you want to collect

# Memory Footprint
constant * O(n) where n = number of API calls to be stored and the constant depends on the size in bytes for the API

# CPU Footprint
Minimal 