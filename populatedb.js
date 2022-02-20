#! /usr/bin/env node

console.log('This script populates some test categories, items to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Item = require('./models/item')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var items = []

function categoryCreate(name, description, cb) {
  categorydetail = {name:name , description: description }
  
  var category = new Category(categorydetail);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category)
  }  );
}

function itemCreate(name, tradeMark, category, price, numberInStock, speed, capacity, dimension, imageUrl, cb) {
  itemdetail = { 
    name: name,
    tradeMark: tradeMark,
    category: category,
    price: price,
    numberInStock: numberInStock
 }

  if (speed != speed) itemdetail.speed = speed
  if (capacity != false) itemdetail.capacity = capacity
  if (dimension != false) itemdetail.dimension = dimension
  if (imageUrl != false) itemdetail.imageUrl = imageUrl

  var item = new Item(itemdetail);

       
  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item);
  }   );
}


function createItemsCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate('Input devices', 'This are devices that help us to input data or information into the Computer', callback);
        },
        function(callback) {
          categoryCreate('Output devices', 'These are devices that help us to display the results of a computer computation', callback);
        },
        function(callback) {
          categoryCreate('Network devices', 'These are devices that help us to connect and share information between computing devices', callback);
        },
        function(callback) {
          categoryCreate('Circuit boards', 'This acts like information highways between components in the computer', callback);
        },
        function(callback) {
          categoryCreate('Storage devices', 'These are devices that store or hold information temporary of permanently', callback);
        },
        function(callback) {
          categoryCreate('Processing', 'This are devices that process data to produce information', callback);
        },
        function(callback) {
          categoryCreate('Accesories', 'These are devices that extend the functionalities of computers', callback);
        }
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate("monitor", "dell", "Output devices", 45, 23, false, false, false, false, callback);
        },
        function(callback) {
          itemCreate("sata hdd", "digital ocean", "Storage devices", 45, 89, 203, 250, false, false, callback);
        },
        function(callback) {
          itemCreate("mother board", "compaq", "Circuit boards", 73, 98, 133, 133, 21, false, callback);
        },
        function(callback) {
          itemCreate("system unit", "lenovo", "Processing", 67, 102, 56, 3000, 512, false, callback);
        }
        ],
        // optional callback
        cb);
}


async.series([
  createItemsCategories,
  createItems
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



