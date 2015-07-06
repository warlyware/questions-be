var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var MD5 = require('MD5');
var slug = require('slug');
var cors = require('cors')

mongoose.connect(process.env.MONGOLAB_URI);


// var User = mongoose.model("users", { name: String });
// var user1 = new User({name: 'from Mongoos'});
// user1.save();
//
// User.find({}, function(err, data) {
//   console.log(data);
// });

var Question = mongoose.model('Question', {
  slug: { type: String, required: true, unique: true },
  body: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  gravatarUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  answers: [{
    email: String,
    body: String,
    slug: String,
    gravatarUrl: String,
    createdAt: {type: Date, default: Date.now }
  }]
});


// temp500Qs = Array.apply(null, Array(500)).map(function(n, i) { return { body: "Q" + i, email: 'test@test.com', slug: "q-" + i, gravatarUrl: "test" } });
// Question.create(temp500Qs, function(err) {
//   console.error(err);
// });

Question.on('index', function(err) {
  if (err) {
    console.error(err);
  }
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Mongo API' });
});

router.get('/tests', function(req, res, next) {
  Question.remove({}, function(err) {
    res.render('tests');
  });
});

router.get('/test', function(req, res, next) {
  res.send("just testing");
});

router.post('/test', function(req, res, next) {
  var response = req.body;
  response.serverTime = new Date();
  res.json(response);
});




router.post("/questions", function(req, res) {
  var question = new Question(req.body);

  question.slug = slug(req.body.body || '');
  question.gravatarUrl = "http://www.gravatar.com/avatar/" + MD5(req.body.email);

  question.save(function(err, savedQuestion) {
    if (err) {
      console.log(err);
      res.status(400).json({ error: "Validation Failed" });
    }
    console.log("savedQuestion:", savedQuestion);
    res.json(savedQuestion);
  });
});

router.get("/questions", function(req, res) {
  Question.find({}).sort({ createdAt: 'desc' }).limit(3).exec(function(err, questions) {
    if (err) {
      console.log(err);
      res.status(400).json({ error: "Could not read questions data" });
    }
    res.json(questions);
  });
});

router.get("/questions/:questionCode", function(req, res) {
  Question.findOne({slug: req.params.questionCode}).exec(function(err, question) {
    if (err) {
      console.log(err);
      res.status(400).json({ error: "Could not read questions data" });
    }
    if (!question) {
      res.status(404);
    }
    res.json(question);
  });
});

router.patch("/questions/:questionCode", function(req, res) {
  console.log(req.body);
  Question.findOneAndUpdate({ slug: req.params.questionCode }, req.body, { new: true }, function(err, updatedQuestion) {
    console.log(err, updatedQuestion);
    if (err) {
      console.log(err);
      res.status(400).json({ error: "Could not read questions data" });
    }
    if (!updatedQuestion) {
      res.status(404);
    }
    res.json(updatedQuestion);
  });
});

router.delete("/questions/:questionCode", cors(), function(req, res) {
  Question.findOneAndRemove({ slug: req.params.questionCode }, function(err, updatedQuestion) {
    console.log(err, updatedQuestion);
    if (err) {
      console.log(err);
      res.status(400).json({ error: "Could not read questions data" });
    }
    if (!updatedQuestion) {
      res.status(404);
    }
    res.json({message: 'question deleted'});
  });
});

router.post("/questions/:slug/answers", function(req, res) {
  Question.findOne({ slug: req.params.slug }, function(err, question) {
    console.log(err, answer);
    if (err) {
      console.log(err);
      res.status(400).json({ error: "Could not read answer data" });
    }
    if (!question) {
      res.status(404);
    }
    var answer = req.body;
    answer.gravatarUrl = "http://www.gravatar.com/avatar/" + MD5(req.body.email);
    question.answers.push(answer);
    question.save(function(err, savedQuestion) {
      if (err) {
        console.log(err);
        res.status(400).json({ error: "Could not read answer data" });
      }
      res.json(savedQuestion);
    });
  });
});

module.exports = router;
