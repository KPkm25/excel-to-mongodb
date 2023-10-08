const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const MongoClient = require('mongodb').MongoClient;
const dotenv=require('dotenv');
dotenv.config();

const app = express();
// const PORT = 3000;
// const mongoURI = '';
  
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
   res.render('upload');
});

const dbName = 'excel-upload';

app.post('/upload', upload.single('excel'), async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    //console.log(req.file)
    const originalFileName = req.file.originalname.split('.')[0];
    const collection = db.collection(originalFileName);

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const result = await collection.insertMany(excelData);
    console.log('Data uploaded successfully:', result.insertedCount, 'records inserted.');
    res.render('success');
  } catch (error) {
    console.error('Error uploading data:', error);
    res.status(500).json({ error: 'Error uploading data to the database.' });
  }
});


// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port  http://localhost:${process.env.PORT}/`);
});
