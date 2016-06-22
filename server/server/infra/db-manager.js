import baseManager from './base-manager';
import nconf from 'nconf';
import assert from 'assert';
import mongoose from 'mongoose';
import User from '../models/user';


const TEST_DB = 'mongodb://' + nconf.get('test_db_user') + ':' + nconf.get('test_db_password') + '@ds015584.mlab.com:15584/psc-test-db';

const dbManager = Object.assign({}, baseManager, {
    /* Database configuration */
    configureDevelopmentEnv(app) {
      mongoose.connect(TEST_DB);
      console.log('Database connected!');
    }
});

export default dbManager;