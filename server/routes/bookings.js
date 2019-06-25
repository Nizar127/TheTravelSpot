// var express = require('express');
// var firebase = require('firebase');
// var bodyParser = require('body-parser');

// var app = express();
// app.use(bodyParser.json()); //need to parse HTTP request body

// var config = {
// 	apiKey: "AIzaSyBR9CCgAuKp0OupBKKKiG-C8islRUaOFFs",
// 	authDomain: "testproject1-203615.firebaseapp.com",
// 	databaseURL: "https://testproject1-203615.firebaseio.com",
// 	projectId: "testproject1-203615",
// 	storageBucket: "testproject1-203615.appspot.com",
// 	messagingSenderId: "681667456637"
// };
// firebase.initializeApp(config);
  
// //Fetch instances
// app.get('/', function (req, res) {

// 	console.log("HTTP Get Request");
// 	var userReference = firebase.database().ref("/Users/");

// 	//Attach an asynchronous callback to read the data
// 	userReference.on("value", 
// 			  function(snapshot) {
// 					console.log(snapshot.val());
// 					res.json(snapshot.val());
// 					userReference.off("value");
// 					}, 
// 			  function (errorObject) {
// 					console.log("The read failed: " + errorObject.code);
// 					res.send("The read failed: " + errorObject.code);
// 			 });
// });

// //Create new instance
// app.put('/', function (req, res) {

// 	console.log("HTTP Put Request");

// 	var userName = req.body.UserName;
// 	var name = req.body.Name;
// 	var age = req.body.Age;

// 	var referencePath = '/Users/'+userName+'/';
// 	var userReference = firebase.database().ref(referencePath);
// 	userReference.set({Name: name, Age: age}, 
// 				 function(error) {
// 					if (error) {
// 						res.send("Data could not be saved." + error);
// 					} 
// 					else {
// 						res.send("Data saved successfully.");
// 					}
// 			});
// });

// //Update existing instance
// app.post('/', function (req, res) {

// 	console.log("HTTP POST Request");

// 	var userName = req.body.UserName;
// 	var name = req.body.Name;
// 	var age = req.body.Age;

// 	var referencePath = '/Users/'+userName+'/';
// 	var userReference = firebase.database().ref(referencePath);
// 	userReference.update({Name: name, Age: age}, 
// 				 function(error) {
// 					if (error) {
// 						res.send("Data could not be updated." + error);
// 					} 
// 					else {
// 						res.send("Data updated successfully.");
// 					}
// 			    });
// });

// //Delete an instance
// app.delete('/', function (req, res) {

//    console.log("HTTP DELETE Request");
//    //todo
// });

// var server = app.listen(8080, function () {
  
//    var host = server.address().address;
//    var port = server.address().port;
   
//    console.log("Example app listening at http://%s:%s", host, port);
// });



var express = require("express");
var router = express.Router();
var mongojs = require("mongojs");

var db = mongojs("mongodb+srv://fakhrul:Nizar127@cluster0-zwtom.mongodb.net/test?retryWrites=true&w=majority", ["bookings"]);

router.get("/bookings", function(req, res, next){
	db.bookings.find(function(err, bookings){
		if(err){
			res.send(err);

		}
		res.json(bookings);
	})
}); 

router.post("/bookings", function(req, res, next){
	var booking = req.body.data;
	var nearByDriver = req.body.nearByDriver;
	var io = req.app.io;

	if(!booking.userName){
		res.status(400);
		res.json({
			error:"Bad data"
		});	
	} else {
		db.bookings.save(booking, function(err, savedBooking){
			if(err){
				res.send(err);
			}
			res.json(savedBooking);
			if(nearByDriver.socketId){
				io.emit(nearByDriver.socketId + "driverRequest", savedBooking);
			}else{
				console.log("Driver not connected");
			}
		});
	}
});

// Driver  Update Booking done on driver side
router.put("/bookings/:id", function(req, res, next){
    var io = req.app.io;
    var booking = req.body;
    if (!booking.status){
        res.status(400);
        res.json({
            "error":"Bad Data"
        });
    } else {
        db.bookings.update({_id: mongojs.ObjectId(req.params.id)},{ $set: { 
        	driverId: booking.driverId,
        	status: booking.status 
        }}, function(err, updatedBooking){
        if (err){
            res.send(err);
        }
        if (updatedBooking){
            //Get Confirmed booking
            db.bookings.findOne({_id:  mongojs.ObjectId(req.params.id)},function(error, confirmedBooking){
                if (error){
                    res.send(error);
                }
                res.send(confirmedBooking);
                io.emit("action", {
                    type:"BOOKING_CONFIRMED",
                    payload:confirmedBooking
                });
            });
        }
    });
    }
});




module.exports = router;
