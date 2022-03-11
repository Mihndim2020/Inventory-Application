var Category = require('../models/category');
var Item = require('../models/item');
const { body,validationResult } = require("express-validator");

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
};

// Display Category create form on GET.
exports.category_create_get = function(req, res) {
    res.render('category_form', { title: 'Create Category' });
};

// Handle Category create on POST.
exports.category_create_post = [
// Validate and sanitize the name field.
body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
body('description', 'Description of the category is required').trim().isLength({ min: 1 }).escape(),

// Process request after validation and sanitization.
(req, res, next) => {

  // Extract the validation errors from a request.
  const errors = validationResult(req);

  // Create a category object with escaped and trimmed data.
  var category = new Category(
    { 
      name: req.body.name,
      description: req.body.description
    }
  );

  if (!errors.isEmpty()) {
    // There are errors. Render the form again with sanitized values/error messages.
    res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
    return;
  }
  else {
    // Data from form is valid.
    // Check if a Category with same name already exists.
    Category.findOne({ 'name': req.body.name })
      .exec( function(err, found_category) {
         if (err) { return next(err); }

         if (found_category) {
           // Category exists, redirect to its detail page.
           res.redirect(found_category.url);
         }
         else {

           category.save(function (err) {
             if (err) { return next(err); }
             // Category saved. Redirect to category detail page.
             res.redirect(category.url);
           });

         }

       });
  }
}
];

// Display Category delete form on GET.
exports.category_delete_get = function(req, res, next) {
  async.parallel({
    category: function(callback) {
        Category.findById(req.params.id).exec(callback)
    },
    category_items: function(callback) {
        Item.find({ 'category': req.params.id }).exec(callback)
    },
}, function(err, results) {
    if (err) { return next(err); }
    if (results.category==null) { // No results.
        res.redirect('/catalog/categories');
    }
    // Successful, so render.
    res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items } );
});
};

// Handle Category delete on POST.
exports.category_delete_post = function(req, res, next) {
  async.parallel({
    category: function(callback) {
      Category.findById(req.body.categoryid).exec(callback)
    },
    category_items: function(callback) {
      Item.find({ 'category': req.body.categoryid }).exec(callback)
    },
  }, function(err, results) {
      if (err) { return next(err); }
      // Success
      if (results.category_items.length > 0) {
          // The category has items. Render in same way as for GET route.
          res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items } );
          return;
      }
      else {
          // Category has no items. Delete object and redirect to the list of categories.
          Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
              if (err) { return next(err); }
              // Success - go to category list
              res.redirect('/inventory/categories')
          })
      }
  });
};

// Display Category update form on GET.
exports.category_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Category update GET');
};

// Handle Category update on POST.
exports.category_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Category update POST');
};
