const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // إنشاء فهارس لتحسين الأداء
    await createIndexes();
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // فهارس للطلاب
    await mongoose.model('Student').createIndexes();
    
    // فهارس للمعلمين
    await mongoose.model('Teacher').createIndexes();
    
    // فهارس للمقررات
    await mongoose.model('Course').createIndexes();
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};

module.exports = connectDB;
