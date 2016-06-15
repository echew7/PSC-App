import baseManager from './base-manager';
import assert from 'assert';
import mongodb from 'mongodb';

const TEST_DB = 'mongodb://${process.env.TEST_USER}:${process.env.TEST_PASSWORD}@ds015584.mlab.com:15584/psc-test-db';

const dbManager = Object.assign({}, baseManager, {
    configureDevelopmentEnv(app) {
        const mongoClient = mongodb.MongoClient;
        mongoClient.connect(TEST_DB, function(err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server.");
            db.close();
        });
    }
});

export default dbManager;