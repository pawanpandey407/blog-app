const bodyParser = require("body-parser"),
methodOverride   = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose         = require("mongoose"),
express          = require("express"),
app              = express();
   
// get rid of depricated: mongoose error while editing the blog post
mongoose.set("useFindAndModify", false);
// APP CONFIG
const url = process.env.DATABASEURL || "mongodb://localhost:27017/restful_blog_app";
mongoose
          .connect(url, {
              useNewUrlParser: true,
              useUnifiedTopology: true
            })
          .then(() => console.log("Connected to Database"))
          .catch((error) => console.log(error.message));

app.set("view engine", "ejs");
// use the custom stylesheet
app.use(express.static(__dirname + '/public'));
// tell express to use body-parser 
// when data get posted, bodyParser lets you retrive those data
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
// SCHEMA SETUP
const blogSchema = new mongoose.Schema({
      title: String,
      image: String,
      body: String,
      created: {type: Date, default: Date.now}
});

// COMPILED SCHEMA INTO MODEL
const Blog = mongoose.model("Blog", blogSchema);

app.get("/", function(req, res) {
    res.redirect("/blogs");
});

// RESTFUL ROUTES
// INDEX ROUTE
app.get("/blogs", function(req, res) {
  // // passing data(blogs) coming from DB and sending under the name blogs(1st one in object)
    Blog.find({}, function(err, blogs) { 
        if(err) {
          console.log("Error!!");
        } else {
          res.render("index", {blogs: blogs});
        }
    });
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body)
  // create blog
  Blog.create(req.body.blog, function(err, newBlog) {
      if(err) {
        res.render("new");
      } else {
        // redirect to the index
        res.redirect("/blogs");
      }
  });
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
      if(err) {
        res.redirect("/blogs");
      } else {
        res.render("show", {blog: foundBlog});
      }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
      if(err) {
        res.redirect("/blogs");
      } else {
        res.render("edit", {blog: foundBlog});
      }
  });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body)
  // takes three arguments i.e. Blog.findByIdAndUpdate(id, newData, callback);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
      if(err) {
        res.redirect("/blogs");
      } else {
        // redirects to the right show page
        res.redirect("/blogs/" + req.params.id);
      }
    });
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res) {
    // destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err) {
      if(err) {
        res.redirect("/blogs");
      } else {
        res.redirect("/blogs");
       }
    });
});

const port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("Server has started");
});