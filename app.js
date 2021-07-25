const express = require("express");
const bodyParser = require("body-parser");
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
const { text } = require("body-parser");

mongoose.connect('mongodb://localhost/scheduler', { useNewUrlParser: true, useUnifiedTopology: true, });
const db = mongoose.connection;
db.on('error', (err) => {
    console.log(err)
});
db.once('open', () => {
    console.log("database connection established");
});

const itemschema = new mongoose.Schema({
    title: String,
    description: String,
    deadline: Date,
    type: String,
    priority: Number,
    tag: String,
});
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemschema],
});

const list = mongoose.model("list", listSchema);
const task = mongoose.model("task", itemschema);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render('index', {});
});

var listname;
var lists;

app.get("/:listname", (req, res) => {
    listname = req.params.listname;
    if (listname == "search") {
        res.write("Error! Search cannot be used as a listname.");
        res.send();
    } else {
        list.countDocuments({ name: listname }, (err, count) => {
            if (err) {
                console.log(err);
            }
            else {


                if (count) {
                    list.findOne({ name: listname }, (error, docs) => {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            lists = docs.items;
                        }
                    });

                    if (lists === undefined || lists.length == 0) {
                        lists = ['Your list is Empty.', 'Add some items to it.'];
                    }

                    res.render('list', { title: listname, lists: lists });
                }
                else {
                    const newlist = new list(
                        {
                            name: listname,
                        });
                    newlist.save((err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("new list created:" + listname);
                        }
                    });
                    res.redirect("/" + listname);
                }
            }
        });
    }

});
app.post("/", (req, res) => {
    //console.log( req.body.deadline+" "+req.body.time);

    var newtask = new task({
        title: req.body.title,
        description: req.body.description,
        deadline: req.body.deadline + " " + req.body.time,
        type: req.body.type,
        priority: req.body.priority,
        tag: req.body.tag,
    });
    newtask.save((err) => {
        if (err) {
            console.log(err);
        } else {
            list.updateOne({ name: listname }, { $push: { items: newtask } }, (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("new task added:" + req.body.title);
                    res.redirect("/" + listname);
                }
            });
        }
    });
});
app.post("/:listname", (req, res) => {
    listname = req.params.listname;
    if (listname != "search") {
        console.log(req.body);

        list.updateOne({ name: listname }, { $pull: { items: { _id: req.body.id } } }, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Task deleted");
                res.redirect("/" + listname);
            }
        })
    } else {
        console.log(req.body);

        task.find({ tag: req.body.tag }, (err, docs) => {
            if (err) {
                console.log(err);
            } else {
                if (!docs.length) {
                    res.render('list', { title: listname, lists: ["We couldn't find anything tagged as: " + req.body.tag] });
                }
                else {
                    res.render('list', { title: listname, query: req.body.tag, lists: docs });
                }
            }
        });


    }
})

//nodemailer send mail

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//            user: 'chaudharyv714@gmail.com',
//            pass: 'iitfaridabad'
//        }
//    });
// const mailOptions = {
//     from: 'sender@email.com', // sender address
//     to: 'vipin_b190922me@nitc.ac.in', // list of receivers
//     subject: 'Subject of your email', // Subject line
//     html: '<p>Your html here</p>'// plain text body
//  };

// transporter.sendMail(mailOptions, function (err, info) {
//     if(err)
//       console.log(err)
//     else
//       console.log(info);
//  }); 


app.listen(8000, (error) => {
    if (error) { console.log(error); }
    else { console.log("Server running at Port:8000"); }

});