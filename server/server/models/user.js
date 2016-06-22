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
  if (!this.created_at)
    this.created_at = currentDate;

  /* Hash password */
  this.password = bcrypt.hashSync(this.password, authConstants.SALT_ITERATIONS);

  next();
});

/* The following provides a simple CRUD interface with added authentication */

/* Authenticates a user and return a JSON token to use for future authentication */
userSchema.statics.authenticate = function(_username, _password) {
  var token = null;
  this.find({ username: _username }, function(err, user) {
    if (err) throw err;

    if (!user) token = userConstants.USER_NOT_FOUND;
    
    
    if (!bcrypt.compareSync(_password, user.password)) token = userConstants.WRONG_PASSWORD;

    console.log('User ' + _username + ' authenticated!');

    token = jwt.sign(user, nconf.get('token_secret'), {
      expiresInMinutes: authConstants.TOKEN_EXPIRATION
    });
  });

  return token;
};

/* Create a user */
userSchema.statics.create = function(_username, _password, _admin) {
  var successful = false;

  const user = new this({
    username: _username,
    password: _password,
    admin: _admin
  });

  /* Save user to database */
  user.save(function(err) {
    if (err) throw err;
    console.log('User ' + user.username + ' created!');
    successful = true;
  });

  return successful;
};

/* Retrieve a user */
userSchema.statics.find = function(_username) {
  var userToFind = null;
  this.find({ username: _username }, function(err, user) {
    if (err) throw err;

    if (!user) {
      userToFind = userConstants.USER_NOT_FOUND;
      return;
    }

    console.log('User ' + user.username + ' found!');
    userToFind = user;
  });

  return userToFind;
};

/* Retrieve all users */
userSchema.statics.findAll = function() {
  var allUsers = {};
  this.find({}, function(err, users) {
    if (err) throw err;

    console.log('Retrieving all users!');

    allUsers = users;
  });

  return allUsers;
}

/* Update a users information */
userSchema.statics.update = function(_username, _update) {
  var success = false;
  this.findOneAndUpdate({ username: _username }, _update, function(err, user) {
    if (err) throw err;

    if (!user) {
      success = userConstants.USER_NOT_FOUND;
      return;
    }

    console.log('User ' + user.username + ' updated!');
    success = true;
  }); 

  return success;
}

/* Removes a user */ 
userSchema.statics.remove = function(_username) {
  var success = false;
  this.findOneAndRemove({ username: _username }, function(err) {
    if (err) throw err;

    console.log('User deleted!');
    success = true;
  }); 

  return success;
}

const User = mongoose.model('User', userSchema);



export default User;