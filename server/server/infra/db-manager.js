import baseManager from './base-manager';
import nconf from 'nconf';
import assert from 'assert';
import mongoose from 'mongoose';

const TEST_DB = 'mongodb://' + nconf.get('test_db_user') + ':' + nconf.get('test_db_password') + '@ds015584.mlab.com:15584/psc-test-db';

const dbManager = Object.assign({}, baseManager, {
    configureDevelopmentEnv(app) {
      mongoose.connect(TEST_DB);
    }
});

export default dbManager;