const { isEmpty } = require("lodash");
const { v4, validate } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const {getSessionToken}=require('../../utils/session')
const getUser = async function (req) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect("/");
  }
  
  const user = await db
    .select("*")
    .from("se_project.sessions")
    .where("token", sessionToken)
    .innerJoin(
      "se_project.users",
      "se_project.sessions.userid",
      "se_project.users.id"
    )
    .innerJoin(
      "se_project.roles",
      "se_project.users.roleid",
      "se_project.roles.id"
    )
   .first();

  user.isNormal = user.roleid === roles.user;
  user.isAdmin = user.roleid === roles.admin;
  user.isSenior = user.roleid === roles.senior;
  return user;
};

module.exports = function (app) {
  // example
  app.get("/users", async function (req, res) {
    try {
       const user = await getUser(req);
      const users = await db.select('*').from("se_project.users")
        
      return res.status(200).json(users);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not get users");
    }
   
  });


  app.put("/api/v1/password/reset", async function (req, res) {
    const newPassword = req.body; // Assuming the password is provided as the entire request body
    const user_info = await getUser(req);
  
    if (!newPassword) {
      return res.status(400).send("password field is empty");
    }
  
    try {
      await db("se_project.users").where({email : user_info.email}).update(password = newPassword );
      return res.status(200).send("Password reset successful");
    } catch (e) {
      console.log(e.message);
      return res.status(500).send("Could not reset password");
    }
  });
  
  
  
  
  


    //---------------------------------------------------------------------------------------------------------------------------------------------//
    //---------------------------------------------------------------------------------------------------------------------------------------------//
    //---------------------------------------------------------------------------------------------------------------------------------------------//
    //---------------------------------------------------------------------------------------------------------------------------------------------//


     app.post('/api/v1/payment/subscription', async function (req, res) {
      const user_info = await getUser(req);
     let ticketQuantity;
      const { creditCardNumber, holderName, payedAmount, subType, zoneId} = req.body;
     
      switch (subType) {
        case 'annual':
          ticketQuantity = 100;
          break;
        case 'quarterly':
          ticketQuantity = 50;

          break;
        case 'monthly':
          ticketQuantity = 10;
          break;
        default:
          return res.status(400).json({ error: 'Invalid subscription type' });
      }


      if (!creditCardNumber) {
        return res.status(400).json({ error: 'Missing credit card number' });
      }
      if (!holderName) {
        return res.status(400).json({ error: 'Missing holder name' });
      }
      if (!payedAmount) {
        return res.status(400).json({ error: 'Missing paid amount' });
      }
      if (!subType) {
        return res.status(400).json({ error: 'Missing subscription type' });
      }
      if (!zoneId) {
        return res.status(400).json({ error: 'Missing zone ID' });
      }
      //get the zone by the zone id then check if no zone catch an error 
      const zone = await db.select("*")
      .from("se_project.zones")
      .where("price", zoneprice);
      console.log(zone);
      if (zone.length == 0) {
        return res.status(400).json({ error: 'Missing zone ID' });
      }


      // Create subscription object and save it
      const subscription = {
        subtype : subType,
       zoneid : zoneId,
       userid : user_info.id,
       nooftickets :  ticketQuantity 
      };


      const subscription2 = await db("se_project.subsription").insert(subscription).innerJoin("se_project.zones").where(id = zoneId).returning("*");
      res.status(201).json(subscription2);
    });

    
 

  
  app.post("/api/v1/refund/:ticketId", async function (req, res) {
    const ticketIdd = req.params;
    const zoneprice = req.params;
const user_info = await getUser(req);

    try {

     

 //get user info 
      //join subs
      //join zone
      //insert zone.price
      // Create subscription object and save it
      const refundticket = {
        status : "pending",
       userid : user_info.id,
       refundamount : zoneprice ,
       ticketid : ticketIdd.id
      };     
     
     
      const refundticket2 = await db("se_project.refund_requests")
      .insert(refundticket).innerJoin("se_project.tickets","se_project.zones")
      .where("id", ticketIdd).where( "price", zoneprice)
      .returning("*");
      

      res.status(201).json(refundticket2);
    } catch (e) {
      console.log(e.message);
      return res.status(500).send("Could not refund a ticket.");
    }
  });


 


  app.post('/api/v1/payment/ticket', async function (req, res) {
    const user_info = await getUser(req);
  
    const { creditCardNumber, holderName, payedAmount, origin, destination, tripdate} = req.body;
   

    //get the zone by the zone id then check if no zone catch an error 
    
    try {

    // Create subscription object and save it
    const ticket = {
      origin: origin,
      destination : destination,
     userid : user_info.id,
     subid : null,
     tripdate : tripdate
    
    }


    const ticket2 = await db("se_project.tickets").insert(ticket).returning("*");
    res.status(201).json(ticket2);

  } catch (e) {
    console.log(e.message);
    return res.status(500).send("Error.");
  }
});

  //find destinantion and innerjoin,outerjoin

  //insert natinal , pending, get user = req senior
  //admin : status : approve and give senior role to user, reject : status

  // POST /api/v1/requests/refund/:ticketId
  
  // app.post("/api/v1/senior/request", async function (req, res) {
  //   const { nationalid } = req.body;

  //   if (!nationalid) {
  //     return res.status(400).send("Senior request cannot be done.");
  //   }

  //   try {
  //     const seniorReq = {
  //       nationalid,
  //     };

  //     const senior = await db("se_project.senior_requests").insert(seniorReq).returning("*");

  //     return res.status(400).json(senior);

  //   } catch (e) {
  //     console.log(e.message);
  //     return res.status(400).send("Couldn't request senior");
  //   }
  // });

  // app.put("/api/v1/ride/simulate", async function (req, res) {
  //   const { origin, destination, tripDate } = req.body;

  //   if (!origin || !destination || !tripDate) {
  //     return res.status(400).send("Ride not simulated.");
  //   }

  //   try {
  //     const simulate = {
  //       origin,
  //       destination,
  //       tripDate,
  //     };

  //     const simulated = await db("se_project.rides").update(simulate).returning("*");

  //   } catch (e) {
  //     console.log(e.message);
  //     return res.status(400).send("Couldn't simulate.");
  //   }
  // });



  // app.post("/api/v1/payment/ticket", async function (req, res) {
  //   const { purchasedId, creditCardNumber, holderName, payedAmount, origin, destination, tripDate } = req.body;

  //   if (!purchasedId || !creditCardNumber || !holderName || !payedAmount || !origin || !destination || !tripDate) {
  //     return res.status(400).send("All fields are required.");
  //   }

  //   try {
  //     const ticket = {
  //       purchasedId,
  //       creditCardNumber,
  //       holderName,
  //       payedAmount,
  //       origin,
  //       destination,
  //       tripDate
  //     };

  //     const insertedTicket = await db("se_project.tickets").insert(ticket).returning("*");

  //     return res.status(200).json(insertedTicket);

  //   } catch (e) {
  //     console.log(e.message);
  //     return res.status(400).send("Payment failed.");
  //   }
  // });

  // app.post("/api/v1/tickets/purchase/subscription", async function (req, res) {
  //   const { subId, origin, destination, tripDate } = req.body;

  //   if (!subId || !origin || !destination || !tripDate) {
  //     return res.status(400).send("All fields are required.");
  //   }

  //   try {
  //     const subscription = await db("se_project.subscriptions").where({ id: subId }).first();

  //     if (!subscription) {
  //       return res.status(404).send("Subscription not found.");
  //     }

  //     const ticket = {
  //       purchasedId: subscription.userId,
  //       creditCardNumber: subscription.creditCardNumber,
  //       holderName: subscription.holderName,
  //       payedAmount: 0,
  //       origin,
  //       destination,
  //       tripDate
  //     };

  //     const insertedTicket = await db("se_project.tickets").insert(ticket).returning("*");

  //     return res.status(200).json(insertedTicket);

  //   } catch (e) {
  //     console.log(e.message);
  //     return res.status(400).send("Payment failed.");
  //   }
  // });




    //---------------------------------------------------------------------------------------------------------------------------------------------//
    //---------------------------------------------------------------------------------------------------------------------------------------------//
    //---------------------------------------------------------------------------------------------------------------------------------------------//
    //---------------------------------------------------------------------------------------------------------------------------------------------//


    app.post("/api/v1/station", async function (req, res) {

      // Check if user already exists in the system
      const stationExists = await db
        .select("*")
        .from("se_project.stations")
        .where("stationname", req.body.stationname);
      if (!isEmpty(stationExists)) {
        return res.status(400).send("station exists");
      }
  
      const newStation = {
        stationname: req.body.stationname,
      };
      try {
        const stationName = await db("se_project.stations").insert(newStation, stationtype = "undefined", stationposition = "undefined", stationstatus = "new" ).returning("*");
  
        return res.status(200).json(stationName);
      } catch (e) {
        console.log(e.message);
        return res.status(400).send("Could not create station");
      }
    });
  

   
  // app.post("/api/v1/station", async function (req, res) {
  //   const stationName = req.body.stationname;
  //     if(!roles.admin){
  //       return res.status(404).send("You are not Admin");
  //     }
  //   try {   
  //     const CreatedStation=await db("se_project.stations").insert({stationname : stationName, stationtype : "normal",  stationposition : "start",stationstatus : "new"}).returning("*");

  //     return res.status(200).send("Created Station successfully : ", CreatedStation);
  //   } catch (e) {
  //     console.log(e.message);
  //     return res.status(400).send("Could not create station");
  //   }
  // });
  

  // app.put("/api/v1/station/:stationId", async function (req, res) {
  //   const stationName = req.body;
  //     const idchecker = req.body.id;
  //     if(!roles.admin){
  //       return res.status(404).send("You are not Admin");
  //     }
  //     if(!id)
  //     {
  //       return res.status(404).send("Wrong station id");
  //     }
  //   try {
  //     await db("se_project.stations").where("id", idchecker).update({ stationname: stationName });
  //     return res.status(200).send("Station has been successfully updated : " , stationName);
  //   } catch (e) {
  //     console.log(e.message);
  //     return res.status(400).send("Station could not be updated");
  //   }
  // });

  app.delete("/api/v1/station/:stationId", async function (req, res) {
    const stationId = req.params.id;
  
    try {
      const station = await db("se_project.stations").where({ id: stationId }).first();
      if (!station) {
        return res.status(404).send("Station not found");
      }
  
      // Delete the station record
      await db("se_project.stations").where({ id: stationId }).del();
  
      // Delete the corresponding station routes
      await db("se_project.stationRoutes").where({ stationid: stationId }).del();
  
      return res.status(200).send("Station deleted successfully");
    } catch (e) {
      console.log(e.message);
      return res.status(500).send("Could not delete station");
    }
  });
  
    

  app.post("/api/v1/route", async function (req, res) {
    const newStationId = req.body.toStationid;
    const connectedStationId = req.body.fromStationid;
    const routeName = req.body.routename;
    if(!roles.admin){
      return res.status(404).send("You are not Admin");
    }
    try { 
      await db("se_project.stationRoutes").insert({toStationid : newStationId, fromStationid : connectedStationId, routename : routeName}).returning("*");
      return res.status(200).send("Created Route successfully : ", newStationId, ",",connectedStationId,",",routeName);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not create route");
    }
  });
  
  app.put("/api/v1/route/:routeId", async function (req, res) {
    const routeName = req.body.routename;
    const idchecker = req.body.id;
    if(!roles.admin){
      return res.status(404).send("You are not Admin");
    }
    if(!id)
    {
      return res.status(404).send("Wrong route id");
    }
    try {
      await db("se_project.stationRoutes").where("id", idchecker).update({ routeName: routeName });
      return res.status(200).send("Route has been successfully updated : " , routeName);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Route could not be updated");
    }
  });


  app.delete("/api/v1/route/:routeId", async function (req, res) {
    const idchecker = req.body.id;
      if(!roles.admin){
        return res.status(404).send("You are not Admin");
      }
      if(!id)
      {
        return res.status(404).send("Wrong route id");
      }
    try {  
      await db("se_project.stationRoutes").where("id", idchecker).del();
      return res.status(200).send("Route has been successfully deleted : " , routename);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Route could not be deleted");
    }
  });


  app.put("/api/v1/requests/refunds/:requestId", async function (req, res) {
    const  refundStatus  = req.body;
    const userId = req.user.id;
    const ticketId = req.body.ticketid;
    if (!refundStatus) {
      return res.status(400).send("Refund status is required");
    }
    try {
      const newRefundRequest = await db("se_project.refund_requests").insert({status: refundStatus,userid: userId, ticketid: ticketId}).returning("*");
      return res.status(201).json(newRefundRequest);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not process refund request");
    }
  });
  
  app.put("/api/v1/requests/senior/:requestId", async function (req, res) {
    const  seniorStaus  = req.body.status;
    const userId = req.user.id;
    const nationalId = req.body.nationalid;
    if (!refundStatus) {
      return res.status(400).send("Refund status is required");
    }
    if(!roles.senior)
    {
      return res.status(400).send("You are not senior");
    }
    try {
      const newRefundRequest = await db("se_project.senior_requests").insert({status: seniorStaus,userid: userId,nationalid : nationalId}).returning("*");
      return res.status(201).json(newRefundRequest);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not process refund request");
    }
  });
  

  app.get("/api/v1/zones", async function (req, res) {
   
    if (!roles.user) {
      return res.status(400).send("You are not authorized to access this resource.");
    }
  
    try {
      const zones = await db("se_project.zones").select("*").returning("*");
      return res.status(200).send(zones);
    } catch (e) {
      console.log(e.message);
      return res.status(500).send("Failed to retrieve zones.");
    }
  });
  


}
