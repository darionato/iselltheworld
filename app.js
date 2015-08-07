var application_root = __dirname,
	express = require("express"),
  	path = require("path"),
  	mongoose = require('mongoose');


// create the app
var app = express.createServer(express.logger());


// get the db path
var mongoUri = 
  process.env.MONGODB_URI || 
  process.env.MONGOLAB_URI ||
	'mongodb://localhost/istw_db';


// Connect
mongoose.connect(mongoUri);


// model
var Sell = mongoose.model('Sell', new mongoose.Schema({
	date: Date,
	desc: String,
	contact: String
}));


// configure the app
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('views', path.join(application_root, "views"));
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
});


app.get('/', function(req, res) {
  res.render('sell', { title: 'I sell the world'});
});


app.get('/sell', function(req, res){
  res.render('sell', {title: "MongoDB Backed Sell App"});
});

app.get('/api/sales', function(req, res){
  return Sell.find(function(err, sales) {
    return res.send(sales);
  });
});

app.get('/api/latestsales', function(req, res){
  return Sell.find().sort('date').limit(2).exec(function(err, sales) {
      return res.send(sales);
  });
});

app.get('/api/sales/:id', function(req, res){
  return Sell.findById(req.params.id, function(err, sell) {
    if (!err) {
      return res.send(sell);
    }
  });
});

app.put('/api/sales/:id', function(req, res){
  return Sell.findById(req.params.id, function(err, sell) {
    sell.date = req.body.date;
    sell.desc = req.body.desc;
    sell.contact = req.body.contact;
    return sell.save(function(err) {
      if (!err) {
        console.log("updated");
      }
      return res.send(sell);
    });
  });
});

app.post('/api/sales', function(req, res){
  var sell;
  sell = new Sell({
    date: req.body.date,
    desc: req.body.desc,
    contact: req.body.contact
  });
  sell.save(function(err) {
    if (!err) {
      return console.log("created");
    }
  });
  return res.send(sell);
});

app.delete('/api/sales/:id', function(req, res){
  return Sell.findById(req.params.id, function(err, sell) {
    return sell.remove(function(err) {
      if (!err) {
        console.log("removed");
        return res.send('')
      }
    });
  });
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});