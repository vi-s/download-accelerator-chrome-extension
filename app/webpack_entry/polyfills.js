import 'core-js/es6';
import 'core-js/es7/reflect';

if (process.env.ENV === 'production') {
  // Production
  console.log('=====> IN PRODUCTION MODE');
} else {
  // Development and test
//   Error['stackTraceLimit'] = Infinity;
  console.log('=====> IN DEV MODE');
}