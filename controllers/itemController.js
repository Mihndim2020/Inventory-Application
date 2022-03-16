var Item = require('../models/item');
var Category = require('../models/category');

var async = require('async');

const { body,validationResult } = require('express-validator');

// Display list of all items.
exports.item_list = function(req, res, next) {

    Item.find({}, 'name tradeMark')
      .sort({name: 1})
      .exec(function (err, list_items) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('item_list', { title: 'Item List', item_list: list_items });
      });
  
  };

// Display detail page for a specific item.
exports.item_detail = function(req, res) {
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id)
              .exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.item==null) { // No results.
            var err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('item_detail', { title: 'Item Detail', item: results.item } );
    });
};

// Display item create form on GET.
exports.item_create_get = function(req, res) {
    async.parallel({
        categories: function(callback) {
            Category.find(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('item_form', { title: 'Create Item', categories: results.categories });
    });
    // categories: Category.find({}, function(err, results){
    //         if (err) { return next(err); }
    //         res.render('item_form', { title: 'Create Item', categories: results.categories });
    //     })
        
    };

// Handle item create on POST.
exports.item_create_post = [
    // Validate and sanitize fields
     body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
     body('tradeMark', 'Trademark must not be empty.').trim().isLength({ min: 1 }).escape(),
     body('category', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
     body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
     body('numberInStock', 'numberInStock must not be empty').trim().isLength({ min: 1 }).escape(),
     body('speed').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).escape(),
     body('capacity').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).escape(),
     body('dimension').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).escape(),
     body('imageUrl').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).escape(),

     // Process the request after validation and sanitation

     (req, res, next) => {

        // Extract validation errors from the request
        const errors = validationResult(req);

        // Create an Item object with escaped and trimmed data. 
        var item = new Item(
          {
            name: req.body.name,
            tradeMark: req.body.tradeMark,
            category: req.body.category,
            price: req.body.price,
            numberInStock: req.body.numberInStock,
            speed: req.body.speed,
            capacity: req.body.capacity,
            dimension: req.body.dimension,
            imageUrl: req.body.imageUrl
          });

          if(!errors.isEmpty()) {
              // There are errors, Render the form again with sanitized values/error messages. 
              async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('item_form', { title: 'Create Item', categories: results.categories, errors: errors.array() });
            });
            return;
          }

          else {
              // Data from the form is valid, Save Item. 
              item.save(function(err){
                  if (err) {return next(err);}
                  // successful, redirect to the new item record
                  res.redirect(item.url);
              });

          }



     }
     
   
];

// Display item delete form on GET.
exports.item_delete_get = function(req, res, next) {
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id).exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item==null) { // No results.
            res.redirect('/inventory/items');
        }
        // Successful, so render.
        res.render('item_delete', { title: 'Delete Item', item: results.item } );
    });
};

// Handle item delete on POST.
exports.item_delete_post = function(req, res, next) {
    async.parallel({
        item: function(callback) {
          Item.findById(req.body.itemid).exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
            if (err) { return next(err); }
            // Success - go to item list
            res.redirect('/inventory/items')
        })
        
    });
};

// Display item update form on GET.
exports.item_update_get = function(req, res, next) {
        // Get items and categories for form.
        async.parallel({
            item: function(callback) {
                Item.findById(req.params.id).populate('category').exec(callback);
            },
            categories: function(callback) {
                Category.find(callback);
            }
            }, function(err, results) {
                if (err) { return next(err); }
                if (results.item==null) { // No results.
                    var err = new Error('Item not found');
                    err.status = 404;
                    return next(err);
                }
                // Success.
                res.render('item_form', { title: 'Update Item', categories: results.categories, item: results.item });
            });
};

// Handle item update on POST.
exports.item_update_post = [
    // Validate and sanitize fields
    body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('tradeMark', 'Trademark must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('category', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('numberInStock', 'numberInStock must not be empty').trim().isLength({ min: 1 }).escape(),
    body('speed').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).escape(),
    body('capacity').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).escape(),
    body('dimension').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).escape(),
    body('imageUrl').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Item object with escaped/trimmed data and old id.
        var item = new Item(
            {
              name: req.body.name,
              tradeMark: req.body.tradeMark,
              category: req.body.category,
              price: req.body.price,
              numberInStock: req.body.numberInStock,
              speed: req.body.speed,
              capacity: req.body.capacity,
              dimension: req.body.dimension,
              imageUrl: req.body.imageUrl,
              _id:req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('item_form', { title: 'Update Item', categories: results.categories, item: item, errors: errors.array() });
            });

            return;
        }
        else {
            // Data from form is valid. Update the record.
            Item.findByIdAndUpdate(req.params.id, item, {}, function (err,theitem) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(theitem.url);
                });
        }
    }  
]
