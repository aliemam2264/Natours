const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// Trust proxy because Heroku work as a proxy.
app.enable('trust proxy');

// Setting the view engine to 'Pug'
app.set('view engine', 'pug');
// Where our pug templates are located
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS.
app.use(cors());

// Preflight phase options.
app.options('*', cors()); // implementing for all routes.
// app.options('/api/v1/tours/:id', cors()); // --> implementing for only tours.

// Serving static files.
app.use(express.static(path.join(__dirname, 'public')));

// Development logging.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// console.log(process.env.NODE_ENV);

// Limit requests from the same API.
const limiter = rateLimit({
  max: 100, // set the max ip requests to 100.
  windowMs: 60 * 60 * 1000, // set this 100 requests over only 1 hour (converted to milliseconds).
  message: 'Too many requests from this ip, Please try again later in an hour!',
});
// implmenting this over any url starts with 'api'.
app.use('/api', limiter);

// Stripe webhook checkout
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // parsed data coming from url.
app.use(cookieParser());

// Data sanitization against NoSQL query injection.
app.use(mongoSanitize());

// Data sanitization against XSS atacks.
app.use(xss());

// Preventing Parameter pollution.
app.use(
  hpp({
    // add the parameters in whitelist to exclude it from parameter pollution.
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// This middleware will compress all the text that sent to client.
app.use(compression());

// Test middleware.
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
