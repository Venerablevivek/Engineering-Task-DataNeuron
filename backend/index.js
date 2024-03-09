// app.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
const corsOptions = {
  origin:true
}

app.get('/',(req,res)=>{
  res.send('Hello ji')
})

const PORT = process.env.PORT || 4000;

// MongoDB connection
mongoose.set('strictQuery', false);
const connectDB = async ()=>{
    try{
    await mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    console.log(`Database connected Successfully`);

    } catch(error){
        console.log(`Database connection Failed`,error.message);
    }
}

// Define schema and model for data
const dataSchema = new mongoose.Schema({
  name: String,
  age: Number,
});
const Data = mongoose.model('Data', dataSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

//global variable to count add and update
var countAdd=0;

// Controllers with Routes to perform add, update and count operation

//controllers, route to add data
app.post('/add', async (req, res) => {
  try {
    // Clear existing data
    await Data.deleteMany({});

    countAdd++;
    // Add new data
    const {name,age} = req.body;
    const newData = await Data.create({
      name:name,
      age:age,
    });
    res.status(201).json(newData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//controllers, route to get data
app.get('/add', async (req, res) => {
  try {
    // Clear existing data
    const data = await Data.find({});

    if(!data){
      return res.status(404).json({
        success:false,
        message:"No data is present"
      })
    }

    return res.status(200).json({
      success:true,
      message:"Data fetched successfully",
      data:data
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success:true,
      message:"Can't get data",
      error:err
    });
  }
});

//controllers, route to update data
app.put('/update', async (req, res) => {
  try {
    //fetch data id from parametes
    const {oldName, name, age} = req.body;
    const updatedData = await Data.findOneAndUpdate({name:oldName},  { $set: 
      { name:name,
        age:age,
    } }, {
      new: true,
    });

    if (!updatedData) {
      return res.status(404).json({
         success:false, 
         message: 'Data not found',
         error: `${updatedData}`
    });
    }

    countAdd++;
    return res.status(200).json({
        success:true,
        message:"Data updated Successfully",
        updatedData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//controllers, route to add data
app.get('/count', async (req, res) => {
  try {

    return res.status(200).json({
      success:true,
      message:"Count fetched Successfully",
      count:countAdd,
  });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
