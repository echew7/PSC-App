import FS from 'fs';
import express from 'express';
import React from 'react'
import {renderToString} from 'react-dom/server';
import {match, RoutingContext} from 'react-router';
import baseManager from './base-manager';
import User from '../models/user';
import userConstants from '../constants/user-constants';
import jwt from 'jsonwebtoken';
import nconf from 'nconf';

const routeManager = Object.assign({}, baseManager, {
  configureDevelopmentEnv(app) {
    const apiRouter = this.createApiRouter();
    const pagesRouter = this.createPageRouter();
    app.use('/api', apiRouter);            
    app.use('/', pagesRouter);            
  },

  createPageRouter() {
    const router = express.Router();
    
    /* Create page routes here */
    router.get('*', (req, res) => {
      res.render('index');
    });
    return router;
  },

  createApiRouter(app) {
    const router = express.Router();

    /* Create API calls here */

    /* USERS API
     *
     * NOTE: The order of the method declarations below are
     * IMPORTANT due to the layers of authentication middleware
     */

    /*** UNAUTHENTICATED CALLS ***/

    /* Authenticate user and retrieve auth token */
    router.post('/users/authenticate', function(req, res) {
      User.authenticate(req.body.username, req.body.password, function(tkn) {
        if (tkn === userConstants.USER_NOT_FOUND) {
          return res.json({ success: false, message: 'Authentication failed. User not found.' });
        }

        if (tkn === userConstants.WRONG_PASSWORD) {
          return res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        }

        res.json({
            success: true,
            message: 'Enjoy your token!',
            token: tkn
        });
      });
    });

    /* Create user */
    router.post('/users', function(req, res) {
      var admin = false;

      if (req.body.admin_password === nconf.get('admin_password'))
        admin = true;

      User.create(req.body.username, req.body.password, admin, function(success) {
        if (success === true)
          res.json({ success: true, message: 'User created!' });
        else
          res.json({ success: false, message: 'Failed to create user.' });
      }); 
    });

    /*** NON-ADMIN AUTHENTICATED CALLS ***/

    /* Layer of authentication middleware that prevents
       unauthenticated users from accessing the API calls below */
    router.use((req, res, next) => {
      /* Check header or url parameters or post parameters for token */
      const token = req.body.token || req.query.token || req.headers['x-access-token'];

      /* Verify and decode token */
      if (token) {
        jwt.verify(token, nconf.get('token_secret'), function(err, decoded) {      
          if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });    
          } else {
            req.decoded = decoded._doc;    
            next();
          }
        });
        
      } else {
        return res.status(403).send({ 
            success: false, 
            message: 'No token provided.' 
        });
      }
    });

    /* Fetch current authenticated user */
    router.get('/users', function(req, res) {
      User.retrieve(req.decoded.username, function(user) {
        if (user === userConstants.USER_NOT_FOUND)
        return res.json({ success: false, message: 'User not found.' });

        res.json({ success: true, payload: user }); 
      });
    });

    /* Update current authenticated user */
    router.put('/users', function(req, res) {
      User.update(req.decoded.username, req.body || req.query, function(tkn) {
        if (tkn === userConstants.USER_NOT_FOUND)
          return res.json({ success: false, message: 'User not found.' });

        res.json({ success: true, message: 'User updated. Enjoy your new token!', token: tkn });
      });
    });

    /* Delete current authenticated user */
    router.delete('/users', function(req, res) {
      User.remove(req.decoded.username, function(success) {
        if (success === false)
          return res.json({ success: false, message: 'Failed to delete user.' });

        res.json({ success: true, message: 'User deleted.' }); 
      });


    });

    /*** ADMIN AUTHENTICATED CALLS ***/


    /* Layer of authentication middleware that prevents
       non admin users from accessing the API calls below */
    router.use((req, res, next) => {
      /* Verify and decode token */
      if (req.decoded.admin === true) {
        next();
      } else {
        return res.status(403).send({ 
            success: false, 
            message: 'No admin priviledges.' 
        });
      }
    });

    /* Fetch any specified user */
    router.get('/admin/users/:username', function(req, res) {
      User.retrieve(req.params.username, function(user) {
        if (user === userConstants.USER_NOT_FOUND)
          return res.json({ success: false, message: 'User not found.' });

        res.json({ success: true, payload: user }); 
      });
    });

    /* Fetch all users */
    router.get('/admin/users', function(req, res) {
      User.retrieveAll(function(users) {
        res.json({ success: true, payload: users });
      });
    });

    /* Update any specified user */
    router.put('/admin/users/:username', function(req, res) {
      User.update(req.params.username,
                  req.body,
                  function(tkn) {
        if (tkn === userConstants.USER_NOT_FOUND)
          return res.json({ success: false, message: 'User not found.' });

        res.json({ success: true, message: 'User updated. Enjoy your new token!', token: tkn });
      });
    });

    /* Delete any specified user */
    router.delete('/admin/users/:username', function(req, res) {
      User.remove(req.params.username, function(success) {
        if (success === false)
          return res.json({ success: false, message: 'Failed to delete user.' });

        res.json({ success: true, message: 'User deleted.' }); 
      });
    });

    return router;
  }

});

export default routeManager;