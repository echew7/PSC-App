import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import nconf from 'nconf';
import jwt from 'jsonwebtoken';
import userConstants from '../constants/user-constants';
import authConstants from '../constants/auth-constants';

const Schema = mongoose.Schema;
const userSchema = new Schema({ 
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: Boolean,
  created_at: Date,
  updated_at: Date
});


/* On every save, add dates and hash password */
userSchema.pre('save', function(next) {
  const currentDate = new Date();

  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }

  /* Hash password */
  this.password = bcrypt.hashSync(this.password, authConstants.SALT_ITERATIONS);

  next();
});

/* The following provides a simple CRUD interface with added authentication */

/* Authenticates a user and return a JSON token to use for future authentication */
userSchema.statics.authenticate = function(_username, _password, callback) {
  this.findOne({ username: _username }, function(err, user) {
    var token = null;
    if (err) throw err;


    if (!user) {
      token = userConstants.USER_NOT_FOUND;
    } else if (bcrypt.compareSync(_password, user.password) === false) {
      token = userConstants.WRONG_PASSWORD;
    } else {
      console.log('User ' + _username + ' authenticated!');

      token = jwt.sign(user, nconf.get('token_secret'), {
        expiresIn: authConstants.TOKEN_EXPIRATION
      });
    }

    callback(token);
  });
};

/* Create a user */
userSchema.statics.create = function(_username, _password, _admin, callback) {
  const user = new this({
    username: _username,
    password: _password,
    admin: _admin
  });

  /* Save user to database */
  user.save(function(err) {
    if (err) throw err;

    console.log('User ' + user.username + ' created!');
    callback(true);
  });
};

/* Retrieve a user */
userSchema.statics.retrieve = function(_username, callback) {
  this.findOne({ username: _username }, function(err, user) {
    var userToFind = null;
    if (err) throw err;

    if (!user) {
      userToFind = userConstants.USER_NOT_FOUND;
    } else { 
      console.log('User ' + user.username + ' found!');
      userToFind = user;
    }

    callback(userToFind);
  });
};

/* Retrieve all users */
userSchema.statics.retrieveAll = function(callback) {
  this.find({}, function(err, users) {
    if (err) throw err;

    console.log('Retrieving all users!');

    callback(users);
  });
}

/* Update a users information */
userSchema.statics.update = function(_username, _update, callback) {
  /* Disallow priviledge escalation */
  delete _update.admin;

  /* Salt password before storage */
  if (_update.password !== undefined) {
    _update.password = bcrypt.hashSync(_update.password, authConstants.SALT_ITERATIONS);
  }

  this.findOneAndUpdate({ username: _username }, _update, {new: true}, function(err, user) {
    var token = null;
    if (err) throw err;

    if (!user) {
      token = userConstants.USER_NOT_FOUND;
    } else {
      console.log('User ' + user.username + ' updated!');
      token = jwt.sign(user, nconf.get('token_secret'), {
        expiresIn: authConstants.TOKEN_EXPIRATION
      });
    }


    callback(token);
  }); 
}

/* Removes a user */ 
userSchema.statics.remove = function(_username, callback) {
  this.findOneAndRemove({ username: _username }, function(err) {
    if (err) throw err;

    console.log('User deleted!');
    callback(true);
  }); 
}

const User = mongoose.model('User', userSchema);



export default User;