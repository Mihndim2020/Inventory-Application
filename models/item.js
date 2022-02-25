var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
  {
    name: {type: String, required: true},
    tradeMark: {type: String, required: true},    
    // category: { type: Schema.Types.ObjectId, ref: "Category", required: true }, //reference to the associated Category
    category: {type: String, ref: "Category"},
    price: {type: Number, required: true},
    numberInStock: {type: Number, required: true},
    speed: {type: Number},
    capacity: {type: Number},
    dimension: {type: Number},
    imageUrl: {type: String}
  }
);

ItemSchema.virtual('url').get(function () {
  return '/inventory/item/' + this._id;
});

//Export model
module.exports = mongoose.model('Item', ItemSchema);
