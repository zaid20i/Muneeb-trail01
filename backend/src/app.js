require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('multer')({ dest: 'src/uploads/' });
const path = require('path');

const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/drivers');
const vehicleRoutes = require('./routes/vehicles');
const contractRoutes = require('./routes/contracts');
const paymentRoutes = require('./routes/payments');
const fineRoutes = require('./routes/fines');
const notificationRoutes = require('./routes/notifications');
const supportRoutes = require('./routes/support');
const documentRoutes = require('./routes/documents');
const reportRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');

const { errorHandler } = require('./middleware/error');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => res.send('API Running!'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); 