var Category = require('../models/category');
var Item = require('../models/item');

var async = require('async');

exports.index = function(req, res) {
    async.parallel({
        category_count: function(callback) {
            Category.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        item_count: function(callback) {
            Item.countDocuments({}, callback);
        } 
    }, function(err, results) {
        res.render('index', { title: 'Computer Store Inventory App', error: err, data: results });
    });
};

// Display list of all Categories.
exports.category_list = function(req, res) {
    Category.find({})
    .sort({name : 1})
    .exec(function (err, list_categories) {
      if (err) { return next(err); }
      console.log(list_categories);
      //Successful, so render
      res.render('category_list', { title: 'Category List', category_list: list_categories });
    });
};

// Display detail page for a specific Category.
exports.category_detail = function(req, res, next) {
    async.parallel({
        category: function(callback) {

            Category.findById(req.params.id)
              .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('category_detail', { title: results.category.name, category: results.category } );
    });

// Display Category create form on GET.
exports.category_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Category create GET');
};

// Handle Category create on POST.
exports.category_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Category create POST');
};

// Display Category delete form on GET.
exports.category_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Category delete GET');
};

// Handle Category delete on POST.
exports.category_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Category delete POST');
};

// Display Category update form on GET.
exports.category_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Category update GET');
};

// Handle Category update on POST.
exports.category_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Category update POST');
};
