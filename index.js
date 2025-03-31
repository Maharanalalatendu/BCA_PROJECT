//index.js commonJS
const express = require("express");
const supabasePromise = require('./supabase_db.js')();
const multer = require('multer');
const path = require('path');
const cors = require("cors");
const Razorpay = require('razorpay');

// Replace with your Razorpay API keys (test keys for now)
const razorpay = new Razorpay({
  key_id: process.env.YOUR_RAZORPAY_TEST_KEY_ID,
  key_secret: process.env.YOUR_RAZORPAY_TEST_KEY_SECRET,
});

const app = express();

require('dotenv').config();
// Use the cors middleware
//*it is use to access to tata in all ip adress 
app.use(express.json()) // to read JSON data come from FrontEnd as 'req'
app.use(cors());

const corsOptions = {
  origin: '*',  // Allow all origins (not recommended for production)
  methods: 'GET, POST, PUT, DELETE', // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
};

app.use(cors(corsOptions)); //CORS use to provide public access to all user to this express API

app.use(express.urlencoded({ extended: false }));//middle ware using for req.body

// Multer Setup (for handling file uploads)
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });


app.get("/api", function (req, res) {
  res.send("wellcome to our wabsite");
});

app.post("/api/resgister", async function (req, res) {
  let email = req.body.email
  let mobile_no = req.body.mobile_no
  let password = req.body.password
  async function getUserByEmail(e_mail) {
    try {
      const supabase = await supabasePromise;
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('email', e_mail);

      if (error) {
        console.error('Error fetching :', error);
        return { error: error };
      }

      return { data: data };
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      return { error: error };
    }
  }

  async function find_Mail_And_Resgister() {
    const emailToFind = email;
    const userResult = await getUserByEmail(emailToFind);

    if (userResult.data && userResult.data.length > 0) {
      res.json({ message: 'you are already resgister', userid: userResult.data[0].id });
    } else if (userResult.data && userResult.data.length === 0) {
      //console.log('user not found.');
      // Sign up with email
      if (mobile_no.length == 10) {
        async function fun() {
          const supabase = await supabasePromise;
          const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
          })
          if (error) {
            return { error: true, message: error.message };

          } else {
            return { error: false, userId: data.user.id };
          }
        }

        async function main() {
          const result = await fun();
          if (!result.error) {
            const supabase = await supabasePromise;
            const { data, error } = await supabase
              .from('user')
              .insert([{ id: result.userId, email: email, password: password, phone: mobile_no }]);
            res.json({ message: 'Insert  completed', userid: result.userId });
          } else {
            res.json({ message: 'Insert  failed.', error: result.message || result.code });
          }
        }
        main();
      } else { res.json({ message: 'mobile no is invlid' }) }
    } else if (userResult.error) {
      res.json({ message: 'Error', error: userResult.error });
    }
  }

  find_Mail_And_Resgister();
})

app.post("/api/login", async function (req, res) {
  let email = req.body.email
  let password = req.body.password
  const supabase = await supabasePromise;
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('email', email)
    .eq('password', password);
  if (error) {
    res.json({ message: 'Error', error: error });
  } else {
    if (data && data.length > 0) {
      res.json({ message: 'login succcessfully', u_id: data[0].id });
    } else {
      res.json({ message: 'invlid gradient' });
    }
  }
})

app.post("/api/search", async function (req, res) {
  let str = req.body.search;
  try {
    function countWords(str) {
      return str.trim().split(/[,\s]+/).filter(word => word);
    }

    let search_arr = countWords(str)

    const supabase = await supabasePromise;
    const { data, error } = await supabase
      .from('jatra')
      .select('*')

    let all = [];

    const now = new Date();
    const nowDateOnly = now.toISOString().split('T')[0];

    for (let i = 0; i < search_arr.length; i++) {
      for (let j = 0; j < data.length; j++) {
        if (search_arr[i] == data[j].city) {
          function compareDates(date1, date2) {
            if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
              return null; // Handle invalid input
            }
            if (date1 < date2) {
              return -1;
            } else if (date1 > date2) {
              return 1;
            } else {
              return 0;
            }
          }
          const dateString1 = nowDateOnly;
          const dateString2 = data[j].date;

          const date1 = new Date(dateString1);
          const date2 = new Date(dateString2);

          const comparisonResult = compareDates(date1, date2);

          if (comparisonResult === -1) {
            all.push(data[j])
          } else if (comparisonResult === 0) {
            all.push(data[j])
          }
        }
        let plc = data[j].place
        function count(plc) {
          return str.trim().split(/[,\s]+/).filter(word => word);
        }
        let place_arr = count(plc)
        for (let k = 0; k < place_arr.length; k++) {
          if (search_arr[i] == place_arr[k]) {
            ; // Extract YYYY-MM-DD
            function compareDates(date3, date4) {
              if (!(date3 instanceof Date) || !(date4 instanceof Date)) {
                return null; // Handle invalid input
              }
              if (date3 < date4) {
                return -1;
              } else if (date3 > date4) {
                return 1;
              } else {
                return 0;
              }
            }
            const dateString3 = nowDateOnly;
            const dateString4 = data[j].date;

            const date3 = new Date(dateString3);
            const date4 = new Date(dateString4);

            const comparisonResult2 = compareDates(date3, date4);

            if (comparisonResult2 === -1) {
              all.push(data[j])
            } else if (comparisonResult2 === 0) {
              all.push(data[j])
            }
          }

        }
      }
    }
    function removeDuplicatesById(arr) {
      const uniqueObjects = {};
      const uniqueArray = [];
      for (const obj of arr) {
        if (!uniqueObjects[obj.id]) {
          uniqueObjects[obj.id] = true;
          uniqueArray.push(obj);
        }
      }

      return uniqueArray;
    }
    const uniqueData = removeDuplicatesById(all);
    if (uniqueData.length == 0) {
      res.json({ message: 'not found' });
    } else {
      let data1 = uniqueData;
      for (let i = 0; i < data1.length; i++) {
        var id = data1[i].jatra_party_id
        const { data, error } = await supabase
          .from('jatra_partner')
          .select('party_name')
          .eq('id', id)
        data1[i].party_name = data[0].party_name;
      }
      res.json({ message: 'found', data: data1 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating order');
  }
})

app.post("/api/seats/jatra_id", async function (req, res) {
  try {
    const jatra_id = req.body.jatra_id;
    const supabase = await supabasePromise;
    const { data, error } = await supabase
      .from('booked_seats')
      .select('*')
      .eq('id', jatra_id)
    if (!error) {
      if (data.length > 0) {
        res.json({ message: 'found data', data: data });
      } else {
        res.json({ message: 'notfound', data: data });
      }

    } else {
      res.json({ message: 'error', error: error });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating order');
  }

})

app.post('/api/booking', async (req, res) => {
  try {

    let u_id = req.body.u_id
    let jatra_id = req.body.jatra_id
    let seats = req.body.seats
    let p_amount = req.body.amount
    //api for razorpay**
    const options = {
      amount: req.body.amount * 100, // Amount in paise
      currency: 'INR',
      receipt: 'order_rcptid_11',
    };
    const order = await razorpay.orders.create(options);
    //api for razorpay.....

    if (order.id) {
      const supabase = await supabasePromise;
      const { data, error } = await supabase
        .from('booking')
        .insert([{ u_id: u_id, jatra_id: jatra_id, seats: seats, pay_id: order.id, amount: p_amount }])
      if (!error) {
        const { data, error } = await supabase
          .from('booked_seats')
          .select('*')
          .eq('id', jatra_id)

        let old_s = data[0].booked
        let d_id1 = data[0].id

        if (d_id1) {
          const { data, error } = await supabase
            .from('booking')
            .select('*')
            .eq('pay_id', order.id);
          // console.log(data[0].seats)
          data[0].seats.forEach(element => {
            old_s.push(element)
          });
          //console.log(old_s)
          try {
            const { data, error } = await supabase
              .from('booked_seats')
              .update({ booked: old_s }) // Update the 'booked' column
              .eq('id', d_id1);
          } catch (error) {
            console.error(error);
            res.status(500).send('Error creating order');
          }
        } else {
          const { data, error } = await supabase
            .from('booked_seats')
            .insert([{ id: jatra_id, booked: seats }])
        }
        // console.log( order)
        res.json({ message: 'successfully payment', data: order });
      } else {
        res.json({ message: 'error', error: error });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating order');
  }
});

app.post("/api/all_booking/user_id", async function (req, res) {
  const user_id = req.body.user_id;
  const supabase = await supabasePromise;
  const { data, error } = await supabase
    .from('booking')
    .select('*')
    .eq('u_id', user_id)
  if (data) {
    res.json({ message: 'found usre data', data: data })
  } else {
    res.json({ message: ' not found' })
  }

})

app.post("/api/party/resgister", async function (req, res) {
  let email = req.body.email
  let mobile_no = req.body.mobile_no
  let password = req.body.password
  let party_name = req.body.party_name
  async function getUserByEmail(e_mail) {
    try {
      const supabase = await supabasePromise;
      const { data, error } = await supabase
        .from('jatra_partner')
        .select('*')
        .eq('email', e_mail);

      if (error) {
        console.error('Error fetching :', error);
        return { error: error };
      }

      return { data: data };
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      return { error: error };
    }
  }

  async function find_Mail_And_Resgister() {
    const emailToFind = email;
    const userResult = await getUserByEmail(emailToFind);

    if (userResult.data && userResult.data.length > 0) {
      res.json({ message: 'you are already resgister', userid: userResult.data[0].id });
    } else if (userResult.data && userResult.data.length === 0) {
      //console.log('user not found.');
      // Sign up with email
      if (mobile_no.length == 10) {
        async function fun() {
          const supabase = await supabasePromise;
          const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
          })
          if (error) {
            return { error: true, message: error.message };

          } else {
            return { error: false, userId: data.user.id };
          }
        }

        async function main() {
          const result = await fun();
          if (!result.error) {
            const supabase = await supabasePromise;
            const { data, error } = await supabase
              .from('jatra_partner')
              .insert([{ id: result.userId, email: email, password: password, phone: mobile_no, party_name: party_name }]);
            res.json({ message: 'Insert  completed', id: result.userId });
          } else {
            res.json({ message: 'Insert  failed.', error: result.message || result.code });
          }
        }
        main();
      } else { res.json({ message: 'mobile no is invlid' }) }
    } else if (userResult.error) {
      res.json({ message: 'Error', error: userResult.error });
    }
  }

  find_Mail_And_Resgister();
})

app.post("/api/party/login", async function (req, res) {
  let email = req.body.email
  let password = req.body.password
  const supabase = await supabasePromise;
  const { data, error } = await supabase
    .from('jatra_partner')
    .select('*')
    .eq('email', email)
    .eq('password', password);
  if (error) {
    res.json({ message: 'Error', error: error });
  } else {
    if (data && data.length > 0) {
      res.json({ message: 'login succcessfully', u_id: data[0].id });
    } else {
      res.json({ message: 'invlid gradient' });
    }
  }
})

app.post("/api/party/uplode_image", upload.single('file'), async function (req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const fileBuffer = req.file.buffer;
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = fileName;
    const supabase = await supabasePromise;
    const { data, error } = await supabase.storage
      .from("imgs")
      .upload(filePath, fileBuffer, { contentType: req.file.mimetype });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Failed to upload to Supabase' });
    }

    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${"imgs"}/${filePath}`;

    res.json({ message: 'Image uploaded successfully', imageUrl: imageUrl });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }


});

app.post("/api/party/add_jatra", async function (req, res) {
  let title = req.body.title
  let description = req.body.description
  let poster = req.body.poster
  let ticket_price = req.body.ticket_price
  let place = req.body.place
  let city = req.body.city
  let date = req.body.date
  let time = req.body.time
  let jatra_party_id = req.body.jatra_party_id
  const supabase = await supabasePromise;
  const { data, error } = await supabase
    .from('jatra')
    .insert([{ title: title, description: description, poster: poster, ticket_price: ticket_price, place: place, city: city, date: date, time: time, jatra_party_id: jatra_party_id }]);
  if (!error) {
    res.json({ message: 'Insert  completed' });
  } else {
    res.json({ message: 'error', error: error });
  }
})

app.post("/api/party/id", async function (req, res) {
  let id = req.body.party_id
  const supabase = await supabasePromise;
  const { data, error } = await supabase
    .from('jatra')
    .select('*')
    .eq('jatra_party_id', id)
  if (data.length > 0) {
    res.json({ message: 'found', data: data });
  } else {
    res.json({ message: 'not found' });
  }
})

app.post("/api/party/jatra_id", async function (req, res) {
  let jatra_id = req.body.jatra_id
  const supabase = await supabasePromise;
  const { data, error } = await supabase
    .from('booked_seats')
    .select('*')
    .eq('id', jatra_id)

  res.json({ message: 'found', data: data });
})

app.post("/api/party/offline_booking", async function (req, res) {
  try {
    let party_id = req.body.party_id
    let jatra_id = req.body.jatra_id
    let seats = req.body.seats
    let p_amount = 0;
    const supabase = await supabasePromise;
    const { data, error } = await supabase
      .from('booking')
      .insert([{ party_id: party_id, jatra_id: jatra_id, seats: seats, amount: p_amount }])
      .select("*")
    let x = data[0].id
    if (!error) {
      const { data, error } = await supabase
        .from('booked_seats')
        .select('*')
        .eq('id', jatra_id)

      let old_s = data[0].booked
      let d_id1 = data[0].id

      if (d_id1) {
        const { data, error } = await supabase
          .from('booking')
          .select('*')
          .eq('id', x);
        // console.log(data[0].seats)
        data[0].seats.forEach(element => {
          old_s.push(element)
        });
        //console.log(old_s)
        try {
          const { data, error } = await supabase
            .from('booked_seats')
            .update({ booked: old_s }) // Update the 'booked' column
            .eq('id', d_id1);
        } catch (error) {
          console.error(error);
          res.status(500).send('Error creating order');
        }
      } else {
        const { data, error } = await supabase
          .from('booked_seats')
          .insert([{ id: jatra_id, booked: seats }])
      }
      // console.log( order)
      res.json({ message: 'successfully booked' });
    } else {
      res.json({ message: 'error', error: error });
    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating order');
  }

})

app.post("/api/admin/login", async function (req, res) {
  let user_name = req.body.user_name
  let password = req.body.password
  if ((user_name == "Admin") && (password == "1234")) {
    res.json({ message: 'found' });
  } else {
    res.json({ message: 'not found' });
  }
})

app.get("/api/admin/all", async function (req, res) {
  const supabase = await supabasePromise;
  const { data, error } = await supabase
    .from('jatra')
    .select('*')
  if (data) {
    let data1 = data;
    for (let i = 0; i < data1.length; i++) {
      var id = data1[i].jatra_party_id
      const { data, error } = await supabase
        .from('jatra_partner')
        .select('party_name')
        .eq('id', id)
      data1[i].party_name = data[0].party_name;
    }
    res.json({ message: data1 })


  } else {
    console.log("error" + error)
    res.json({ message: "data not found or error" })
    //console.log(error)
  }

})

app.get("/api/admin/all_booking", async function (req, res) {
  const supabase = await supabasePromise;
  const { data, error } = await supabase
    .from('booking')
    .select('*')
  if (data) {
    res.json({ message: 'found usre data', data: data })
  } else {
    res.json({ message: ' not found' })
  }

})

app.post("/api/admin/delete", async function (req, res) {
  let id = req.body.jatra_id
  const supabase = await supabasePromise;
  const { data, error } = await supabase
    .from('jatra')
    .delete()
    .eq('id', id);
  res.json({ message: "deleted" })

})

const port = 3000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});