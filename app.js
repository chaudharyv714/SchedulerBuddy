const express = require("express");
const bodyParser = require("body-parser");
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
const { text } = require("body-parser");
const SendmailTransport = require("nodemailer/lib/sendmail-transport");

var dburllocal='mongodb://localhost/scheduler';
var dburlglobal="mongodb+srv://chaudharyv714:chaudharyv714@cluster0.r5erw.mongodb.net/scheduler?retryWrites=true&w=majority";
mongoose.connect(dburllocal, { useNewUrlParser: true, useUnifiedTopology: true, });
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
    reminder: Boolean,
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
    res.render('index', { title: "Home" });
});


var listname;
var lists;
var demolist = [
    {
        _id: "garbage_ID",
        title: 'No Data',
        description: 'No Entry populated',
        deadline: new Date(),
        type: 'Once',
        priority: 0,
        tag: 'garbage_data',
        __v: 0
    },

];
app.get("/:listname", (req, res) => {
    listname = req.params.listname;

    if (listname == "search" || listname == "overdue") {
        res.write("Error! \'Search\' or \'Overdue\' cannot be used as a listname.");
        res.send();
    } else if (listname == "namelist") {
        list.find({}, (err, docs) => {
            if (err) {
                console.log(err);
            } else {
                res.render('namelist', { title: "Lists", namelist: docs });
            }
        })
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
                        demolist[0].description = 'Your list is Empty. Add some items to it.';
                        lists = demolist;
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
                            console.log(2);
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
        tag: req.body.tag.toLowerCase(),
        reminder: false,
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

    if (listname == "search") {
        console.log(req.body);

        task.find({ tag: req.body.tag.toLowerCase() }, (err, docs) => {
            if (err) {
                console.log(err);
            } else {
                if (!docs.length) {
                    demolist[0].title = "No Results";
                    demolist[0].description = "We couldn't find anything tagged as: " + req.body.tag;

                    res.render('list', { title: listname, query: req.body.tag, lists: demolist });
                }
                else {
                    console.log(docs);
                    res.render('list', { title: listname, query: req.body.tag, lists: docs });
                }
            }
        });
    } else if (listname == "overdue") {
        let today = new Date();
        task.find({ deadline: { $lt: today } }, (err, docs) => {
            if (err) {
                console.log(err);
            } else {
                if (!docs.length) {
                    demolist[0].title = "No items overdue";
                    demolist.description = "We are upto date. No overdue items";
                    res.render('list', { title: listname, lists: demolist });
                }
                else {
                    res.render('list', { title: listname, lists: docs });
                }
            }
        });

    } else if (listname == "namelist") {
        const newlist = new list(
            {
                name: req.body.title,
            });
        newlist.save((err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("new list created:" + req.body.title);
                console.log(1);
            }
        });
        res.redirect("/namelist");
    }
    else {
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

    }
})

//nodemailer send mail
var sendReminder = (element) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'chaudharyv714@gmail.com',
            pass: 'iitfaridabad'
        }
    });
    const mailOptions = {
        from: 'sender@email.com', // sender address
        to: 'vipin_b190922me@nitc.ac.in', // list of receivers
        subject: 'You have a task coming Up ', // Subject line
        html: 'Following task is still undone:<h2>' + element.title + '</h2><p>Title:' + element.title + '</p><p>Description:' + element.description + '</p><p>Due Date:' + element.deadline + '</p><p>Tag:' + element.tag + '</p>'  // plain text body
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log("Reminder Sent\n" + info);
    });
};

var today = new Date();
task.find({ deadline: { $lt: today }, reminder: false }, (err, docs) => {
    if (err) {
        console.log(err);
    } else {
        if (docs.length!=0) {
            console.log(docs.length);
            console.log(docs);
            docs.forEach(element => {
                sendReminder(element);
                task.updateOne({_id:element._id},{reminder:true},(err)=>{
                    if(err){
                        console.log(err);
                    }else{
                       console.log(' Reminder Updated');
                    }
                });
            });
        }
    }
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, (error) => {
    if (error) { console.log(error); }
    else { console.log("Server running at Port:8000"); }

});