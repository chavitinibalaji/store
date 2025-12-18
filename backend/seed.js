require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/b-busket';

const samples = [
  { name: 'Bananas (1 kg)', price: 60, category: 'Fruits', description: 'Fresh bananas', image: 'https://via.placeholder.com/300?text=Bananas' },
  { name: 'White Bread', price: 35, category: 'Bakery', description: 'Whole wheat bread', image: 'https://via.placeholder.com/300?text=Bread' },
  { name: 'Milk (1L)', price: 45, category: 'Dairy', description: 'Fresh milk', image: 'https://via.placeholder.com/300?text=Milk' },
  { name: 'Eggs (6 pcs)', price: 70, category: 'Dairy', description: 'Farm eggs', image: 'https://via.placeholder.com/300?text=Eggs' },
  { name: 'Rice (5 kg)', price: 420, category: 'Grains', description: 'Basmati rice', image: 'https://via.placeholder.com/300?text=Rice' },
  { name: 'Tomatoes (1 kg)', price: 40, category: 'Vegetables', description: 'Red tomatoes', image: 'https://via.placeholder.com/300?text=Tomatoes' }
];

async function seed(){
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', MONGODB_URI);
  try{
    await Product.deleteMany({});
    const inserted = await Product.insertMany(samples);
    console.log('Inserted', inserted.length, 'products');
  }catch(err){
    console.error(err);
  }finally{
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seed();
