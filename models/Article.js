var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');
var User = mongoose.model('User');

var ArticleSchema = new mongoose.Schema({

  slug: {type: String, lowercase: true, unique: true},
  title: String,
  description: String,
  body: String,
  favoritesCount: {type: Number, default: 0},
  tagList: [{ type: String }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref:'Comment' }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
}, {timestamps: true, usePushEach: true});

ArticleSchema.plugin(uniqueValidator, {message: 'is already taken'});

// https://mongoosejs.com/docs/middleware.html
// https://stackoverflow.com/questions/31471940/mongoose-difference-between-pre-save-and-validate-when-to-use-which-one
ArticleSchema.pre('validate', function(next){
	if(!this.slug){
		this.slugify();
	}

	next();
});

ArticleSchema.methods.updateFavoriteCount = function() {
  var article = this;

  return User.count({favorites: {$in: [article._id]}}).then(function(count){
    article.favoritesCount = count;

    return article.save();
  });
};

// https://www.npmjs.com/package/slug
ArticleSchema.methods.slugify = function() {
	this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6 | 0).toString(36))
};



ArticleSchema.methods.toJSONFor = function(user){
	return {
		slug: this.slug,
		title: this.title,
		description: this.description,
		body: this.body,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
		tagList: this.tagList,
		favorited: user ? user.isFavorite(this._id) : false,
		favoritesCount: this.favoritesCount,
		author: this.author.toProfileJSONFor(user)
	};
};

mongoose.model('Article', ArticleSchema);

// Remember to add this require('./models/Article'); in app.js